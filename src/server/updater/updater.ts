import { config } from '../../config'
import prisma from '../../db/dbClient'
import { Converter } from './converter'
import { RiotApi } from './riotApi'

export abstract class Updater {
    private static riot = new RiotApi(config.RIOT_TOKEN)

    /**
     * Main function to get updates
     */
    static update = async () => {
        const puuids = await Updater.getPuuids()
        const newMatches = await Updater.getMatchIds(puuids)
        await Converter.init()
        
        newMatches.forEach(async matchId => {
            const data = await Updater.riot.getMatch(matchId)
            await Updater.parseAndInsertMatch(data)
            await Updater.parseAndInsertSummonerStats(data.info.participants, matchId)
        })
    }

    /**
     * Get PUUIDs located in db.
     * @returns Array of PUUIDs
     */
    private static getPuuids = async () => {
        try {
            const puuids = (await prisma.instance.summoner.findMany({
                select: {
                    puuid: true
                }
            })).map(s => s.puuid)
            return new Set(puuids)
        }
        catch (e) {
            console.error('An error occurred when getting PUUIDS: ', e)
            return new Set<string>()
        }
    }

    /**
     * Fetch new match IDs by examining match history of each PUUID.
     * @param puuids PUUIDs to fetch match IDs of
     * @returns Set of new match IDs
     */
    private static getMatchIds = async (puuids: Set<string>) => {
        const newMatches: Set<string> = new Set()
        for (const puuid of puuids) {
            try {
                // Get latest timestamp of summoner from db
                const timestamps = (await prisma.instance.summonerStats.findMany({
                    where: { puuid },
                    select: {
                        match: true
                    }
                })).map(m => Math.round(m.match.startTime.getTime() / 1000) + m.match.duration + 120) // Buffer of 120 seconds

                // Get latest match ID from Riot API
                let matchIds: string[]
                if (timestamps.length > 0) matchIds = await Updater.riot.getSummonerMatchIds(puuid, Math.max(...timestamps))
                else matchIds = await Updater.riot.getSummonerMatchIds(puuid)

                // Add new match IDs to set
                matchIds.forEach(newMatches.add, newMatches)
            }
            catch (e) {
                console.error('An error occurred when getting match IDs: ', e)
            }
        }
        return newMatches
    }

    /**
     * Get expected match data from an API response.
     * @param data Match response data from Riot API
     */
    private static parseAndInsertMatch = async (data: any) => {
        try {
            const [queue, map] = await Converter.convertQueueIdToNameAndMap(data.info.queueId)
            await prisma.instance.match.create({
                data: {
                    matchId: data.metadata.matchId,
                    startTime: new Date(data.info.gameStartTimestamp),
                    duration: data.info.gameDuration,
                    queue,
                    map,
                    version: data.info.gameVersion,
                    winningTeam: data.info.participants.win ? 'BLUE' : 'RED'
                }
            })
        }
        catch (e) {
            console.error('An error occurred.', e)
        }
    }

    /**
     * Get expected summoner data from a match API response.
     * @param summonersData Participants data from Riot API.
     * @param matchId The match that the data corresponds to.
     */
    private static parseAndInsertSummonerStats = async (summonersData: any[], matchId: string) => {
        for (const data of summonersData) {
            try {
                // Determine if summoner is followed
                const puuid = data.puuid
                const testCount = await prisma.instance.summoner.count({ where: { puuid } })

                if (testCount === 0) continue

                const champion = await Converter.convertChampionIdToName(data.championId)
                await prisma.instance.summonerStats.create({
                    data: {
                        puuid,
                        matchId,
                        kills: data.kills,
                        deaths: data.deaths,
                        assists: data.assists,
                        champion,
                        position: data.teamPosition,
                        team: data.teamId === 100 ? 'BLUE' : 'RED',
                        totalTimeDead: data.totalTimeSpentDead,
                        challenges: data.challenges
                    }
                })
            }
            catch (e) {
                console.error('An error occurred when parsing summoner stats: ', e)
            }
        }
    }
}

