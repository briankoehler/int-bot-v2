import { config } from '../../config'
import { prisma } from '../server'
import { RiotApi } from './riotApi'

export class Updater {
    private riot = new RiotApi(config.RIOT_TOKEN)

    /**
     * Main function to get updates
     */
    update = async () => {
        const puuids = await this.getPuuids()
        const newMatches = await this.getMatchIds(puuids)

        for (const matchId of newMatches) {
            const data = await this.riot.getMatch(matchId)
            await this.parseAndInsertMatch(data)
            await this.parseAndInsertSummonerStats(data.info.participants, matchId)
        }
    }

    /**
     * Get PUUIDs located in db.
     * @returns Array of PUUIDs
     */
    private getPuuids = async () => {
        const puuids = (await prisma.summoner.findMany({
            select: {
                puuid: true
            }
        })).map(s => s.puuid)
        return new Set(puuids)
    }

    /**
     * Fetch new match IDs by examining match history of each PUUID.
     * @param puuids PUUIDs to fetch match IDs of
     * @returns Set of new match IDs
     */
    private getMatchIds = async (puuids: Set<string>) => {
        const newMatches: Set<string> = new Set()
        for (const puuid of puuids) {
            // Get latest timestamp of summoner from db
            const timestamps = (await prisma.summonerStats.findMany({
                where: { puuid },
                select: {
                    match: true
                }
            })).map(m => (m.match.startTime.getTime() / 1000) + m.match.duration)

            // Get latest match ID from Riot API
            let matchIds: string[]
            if (timestamps.length > 0) matchIds = await this.riot.getSummonerMatchIds(puuid, Math.max(...timestamps))
            else matchIds = await this.riot.getSummonerMatchIds(puuid)

            // Add new match IDs to set
            matchIds.forEach(newMatches.add, newMatches)
        }
        return newMatches
    }

    /**
     * Get expected data from an API response.
     * @param data Match response data from Riot API
     */
    private parseAndInsertMatch = async (data: any) => {
        await prisma.match.create({
            data: {
                matchId: data.metadata.matchId,
                startTime: new Date(data.info.gameStartTimestamp),
                duration: data.info.gameDuration,
                queue: 'PLACEHOLDER',
                map: 'PLACEHOLDER',
                version: data.info.gameVersion,
                winningTeam: data.info.participants.win ? 'BLUE' : 'RED'
            }
        })
    }

    private parseAndInsertSummonerStats = async (summonersData: any[], matchId: string) => {
        for (const data of summonersData) {
            // Determine if summoner is followed
            const puuid = data.puuid
            const testCount = await prisma.summoner.count({ where: { puuid } })
            if (testCount <= 0) continue

            await prisma.summonerStats.create({
                data: {
                    puuid,
                    matchId,
                    kills: data.kills,
                    deaths: data.deaths,
                    assists: data.assists,
                    champion: 'PLACEHOLDER',
                    position: data.teamPosition,
                    team: data.teamId === 100 ? 'BLUE' : 'RED',
                    totalTimeDead: data.totalTimeSpentDead,
                    challenges: data.challenges
                }
            })
        }
    }
}

