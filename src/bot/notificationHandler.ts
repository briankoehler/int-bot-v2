import { Guild, Summoner, SummonerStats } from '@prisma/client'
import { Client } from 'discord.js'
import { performSafePrismaOperation } from '../common/helpers'
import { Result } from '../common/types/errors'
import prisma from '../db/dbClient'
import { getMessage } from './getMessage'
import { isSummonerStats } from './helpers'

/**
 * Handle a postgres notification event and send necessary messages.
 */
export class NotificationHandler {
    private client: Client

    constructor(client: Client) {
        this.client = client
    }

    /**
     * Handle the notification (send necessary messages).
     * @param payload Payload from the Postgres notification
     */
    handle = async (payload: string): Promise<Result<null>> => {
        const statsResult = this.parsePayload(payload)
        if (!statsResult.ok) return statsResult
        const stats = statsResult.value

        if (!this.isInt(stats.kills, stats.deaths, stats.assists)) return { ok: true, value: null }

        const summoner = await this.getSummoner(stats.puuid)
        if (summoner === null || summoner == undefined)
            return { ok: false, value: Error(`Unable to identify summoner: ${stats.puuid}`) }

        const followers = await this.getFollowers(stats.puuid)
        if (followers == undefined)
            return { ok: false, value: Error(`Unable to identify followers for: ${stats.puuid}`) }

        followers.forEach(async guild => {
            const message = getMessage(
                summoner.value.name,
                stats.kills,
                stats.deaths,
                stats.assists
            )

            if (!message.ok) return { ok: false, value: message.value }
            await this.sendMessages(guild, message.value)
        })

        return { ok: true, value: null }
    }

    /**
     * Parse the payload string into a SummonerStats object.
     * @param payload Payload from Postgres notification
     * @returns SummonerStats object
     */
    private parsePayload = (payload: string): Result<SummonerStats> => {
        const stats = JSON.parse(payload)

        if (!isSummonerStats(stats))
            return { ok: false, value: Error(`Unable to parse notification payload: ${stats}`) }
        return { ok: true, value: stats }
    }

    /**
     * Get data for a summoner from PUUID.
     * @param puuid Summoner puuid
     * @returns Summoner data
     */
    private getSummoner = async (puuid: string): Promise<Result<Summoner>> => {
        const op = await performSafePrismaOperation(async () => {
            return await prisma.instance.summoner.findFirst({ where: { puuid } })
        })

        if (!op.ok) return op

        if (op.value === null)
            return { ok: false, value: Error(`Unable to find summoner: ${puuid}`) }
        return { ok: true, value: op.value }
    }

    /**
     * Get all guilds that are following the summoner.
     * @param puuid Summoner PUUID to retrieve followers for
     * @returns Followers for the given summoner
     */
    private getFollowers = async (puuid: string) => {
        const op = await performSafePrismaOperation(async () => {
            return await prisma.instance.guildFollowing.findMany({
                where: { puuid },
                select: { guild: true }
            })
        })

        if (!op.ok) {
            console.error(op.value)
            return
        }

        return op.value.map(g => g.guild)
    }

    /**
     * Send a message to a guild.
     * @param guild Guild object to send messages to
     * @returns void
     */
    private sendMessages = async (guild: Guild, message: string) => {
        if (guild.channelId === null) return

        const channel = this.client.channels.cache.get(guild.channelId)
        if (channel === undefined || channel.type !== 'GUILD_TEXT') return

        await channel.send(message)
    }

    /**
     * PLACEHOLDER function to determine if a scoreline is an "int"
     * @param kills Number of kills
     * @param deaths Number of deaths
     * @param assists Number of assists
     * @returns Whether the scoreline is an "int"
     */
    private isInt = (kills: number, deaths: number, assists: number) => {
        if ((kills * 2 + assists) / (deaths * 2) < 1.3 && deaths - kills > 2 && deaths > 3) {
            if (deaths < 6 && kills + assists > 3) return false
            if (deaths < 10 && kills > 2 && kills + assists > 7) return false
            return true
        }
        return false
    }
}
