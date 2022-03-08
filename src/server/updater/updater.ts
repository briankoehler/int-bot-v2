import { performSafePrismaOperation } from '../../common/helpers'
import { RiotApi } from '../../common/riotApi'
import { handleResult, Result } from '../../common/types/errors'
import { MatchResponse, ParticipantData } from '../../common/types/riotResponse'
import { config } from '../../config'
import prisma from '../../db/dbClient'
import { Converter } from './converter'

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
            try {
                const data = handleResult(await Updater.riot.getMatch(matchId))
                handleResult(await Updater.parseAndInsertMatch(data))
                await Updater.parseAndInsertSummonerStats(data.info.participants, matchId)
            } catch (e) {
                console.error(`Error on match ${matchId}: `, e)
            }
        })
    }

    /**
     * Get PUUIDs located in db.
     * @returns Array of PUUIDs
     */
    private static getPuuids = async () => {
        const summonersOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.summoner.findMany({
                select: {
                    puuid: true
                }
            })
        })

        if (!summonersOp.ok) return new Set<string>()
        return new Set(summonersOp.value.map(summoner => summoner.puuid))
    }

    /**
     * Fetch new match IDs by examining match history of each PUUID.
     * @param puuids PUUIDs to fetch match IDs of
     * @returns Set of new match IDs
     */
    private static getMatchIds = async (puuids: Set<string>) => {
        const newMatches: Set<string> = new Set()

        for (const puuid of puuids) {
            // Get latest timestamp of summoner from db
            const timestampsOp = await performSafePrismaOperation(async () => {
                return await prisma.instance.summonerStats.findMany({
                    where: { puuid },
                    select: {
                        match: true
                    }
                })
            })

            if (!timestampsOp.ok) {
                console.error(timestampsOp.value)
                continue
            }

            const timestamps = timestampsOp.value.map(
                m => Math.round(m.match.startTime.getTime() / 1000) + m.match.duration + 120
            ) // Buffer of 120 seconds

            // Get latest match ID from Riot API
            let matchIds: string[]
            const result =
                timestamps.length > 0
                    ? await Updater.riot.getSummonerMatchIds(puuid, Math.max(...timestamps))
                    : await Updater.riot.getSummonerMatchIds(puuid)
            if (result.ok) matchIds = result.value
            else continue

            // Add new match IDs to set
            matchIds.forEach(newMatches.add, newMatches)
        }

        return newMatches
    }

    /**
     * Get expected match data from an API response.
     * @param data Match response data from Riot API
     */
    private static parseAndInsertMatch = async (data: MatchResponse): Promise<Result<unknown>> => {
        const [queue, map] = await Converter.convertQueueIdToNameAndMap(data.info.queueId)

        const matchOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.match.create({
                data: {
                    matchId: data.metadata.matchId,
                    startTime: new Date(data.info.gameStartTimestamp),
                    duration: data.info.gameDuration,
                    queue,
                    map,
                    version: data.info.gameVersion,
                    winningTeam: data.info.participants[0].win ? 'BLUE' : 'RED'
                }
            })
        })

        if (!matchOp.ok) return matchOp

        return { ok: true, value: null }
    }

    /**
     * Get expected summoner data from a match API response.
     * @param summonersData Participants data from Riot API.
     * @param matchId The match that the data corresponds to.
     */
    private static parseAndInsertSummonerStats = async (
        summonersData: ParticipantData[],
        matchId: string
    ) => {
        for (const data of summonersData) {
            // Determine if summoner is followed
            const puuid = data.puuid
            const testCount = await prisma.instance.summoner.count({
                where: { puuid }
            })

            if (testCount === 0) continue

            const champion = await Converter.convertChampionIdToName(data.championId)

            return await performSafePrismaOperation(async () => {
                return await prisma.instance.summonerStats.create({
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
            })
        }
    }
}
