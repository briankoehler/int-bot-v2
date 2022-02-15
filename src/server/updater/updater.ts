import { Match } from '@prisma/client'
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
            this.parseAndInsertMatch(data)
            this.parseAndInsertSummonerStats(data.info.participants)
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
            
            const matchIds: string[] = await this.riot.getSummonerMatchIds(puuid, Math.max(...timestamps))
            matchIds.forEach(newMatches.add, newMatches)
        }
        return newMatches
    }

    /**
     * Get expected data from an API response.
     * @param info Match response data from Riot API
     */
    private parseAndInsertMatch = async (info: any) => {
        const data: Match = {
            matchId: info.matchId,
            startTime: info.info.gameStartTimestamp,
            duration: info.info.gameDuration,
            queue: 'PLACEHOLDER',
            map: 'PLACEHOLDER',
            version: info.info.gameVersion,
            winningTeam: info.info.participants.win ? 'BLUE' : 'RED'
        }
        await prisma.match.create({ data })
    }

    private parseAndInsertSummonerStats = async (summoners: any[]) => {
        for (const summoner of summoners) {
            const puuid = summoner.puuid
            const testCount = await prisma.summoner.count({ where: { puuid } })
            if (testCount <= 0) continue

            
        }
    }
    
    // private bigIntMax = (arr: bigint[]) => arr.reduce((m, e) => e > m ? e : m)
}

