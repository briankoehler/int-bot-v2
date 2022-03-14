import { performSafePrismaOperation } from '../../common/helpers'
import { handleResult } from '../../common/types/errors'
import { MatchResponse, ParticipantData } from '../../common/types/riotResponse'
import prisma from '../../db/dbClient'
import { Converter } from './converter'
import { Updater } from './updater'

export abstract class MatchUpdater extends Updater {
    /**
     * Main function to get updates
     */
    static update = async () => {
        const puuids = new Set((await MatchUpdater.getSummoners()).map(summoner => summoner.puuid))
        const newMatches = await MatchUpdater.getMatchIds(puuids)
        const didInit = await Converter.init()

        if (!didInit.ok) {
            console.error('Error when initializing converter: ', didInit.value.message)
            return
        }

        newMatches.forEach(async matchId => {
            try {
                const data = handleResult(await MatchUpdater.riot.getMatch(matchId))
                await MatchUpdater.parseAndInsertMatch(data)
                await MatchUpdater.parseAndInsertSummonerStats(data.info.participants, matchId)
            } catch (e) {
                console.error(`Error on match ${matchId}: `, e)
            }
        })
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
                    select: { match: true }
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
                    ? await MatchUpdater.riot.getSummonerMatchIds(puuid, Math.max(...timestamps))
                    : await MatchUpdater.riot.getSummonerMatchIds(puuid)
            if (result.ok) matchIds = result.value
            else continue

            // Add new match IDs to set
            matchIds.forEach(newMatches.add, newMatches)
        }

        // Remove old match IDs from set
        const removalsOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.match.findMany({
                where: { matchId: { in: Array.from(newMatches) } }
            })
        })

        if (!removalsOp.ok) {
            console.error(removalsOp.value)
            return newMatches
        }

        removalsOp.value.forEach(match => newMatches.delete(match.matchId))
        return newMatches
    }

    /**
     * Get expected match data from an API response.
     * @param data Match response data from Riot API
     */
    private static parseAndInsertMatch = async (data: MatchResponse) => {
        const [queue, map] = handleResult(
            await Converter.convertQueueIdToNameAndMap(data.info.queueId)
        )

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

        if (!matchOp.ok) throw matchOp.value
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
            const testCount = await prisma.instance.summoner.count({ where: { puuid } })

            if (testCount === 0) continue

            const champion = handleResult(await Converter.convertChampionIdToName(data.championId))

            await performSafePrismaOperation(async () => {
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
