import { Guild } from '@prisma/client'
import { Client } from 'discord.js'
import prisma from '../db/dbClient'
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
    handle = async (payload: string) => {
        const stats = this.parsePayload(payload)

        const summoner = await this.getSummoner(stats.puuid)
        if (summoner === null || summoner == undefined)
            throw Error(`Unable to identify summoner: ${stats.puuid}`)

        const followers = await this.getFollowers(stats.puuid)
        if (followers == undefined) throw Error(`Unable to identify summoner: ${stats.puuid}`)

        followers.forEach(async guild => await this.sendMessages(guild, 'message'))
    }

    /**
     * Parse the payload string into a SummonerStats object.
     * @param payload Payload from Postgres notification
     * @returns SummonerStats object
     */
    private parsePayload = (payload: string) => {
        const stats = JSON.parse(payload)

        if (!isSummonerStats(stats)) throw Error(`Unable to parse notification payload: ${stats}`)
        return stats
    }

    /**
     * Get data for a summoner from PUUID.
     * @param puuid Summoner puuid
     * @returns Summoner data
     */
    private getSummoner = async (puuid: string) => {
        try {
            return await prisma.instance.summoner.findFirst({
                where: { puuid }
            })
        } catch (e) {
            console.error('Unable to find PUUID: ', puuid)
        }
    }

    /**
     * Get all guilds that are following the summoner.
     * @param puuid Summoner PUUID to retrieve followers for
     * @returns Followers for the given summoner
     */
    private getFollowers = async (puuid: string) => {
        try {
            return (
                await prisma.instance.guildFollowing.findMany({
                    where: { puuid },
                    select: {
                        guild: true
                    }
                })
            ).map(g => g.guild)
        } catch (e) {
            console.error('Unable to find followers of ', puuid)
        }
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
}
