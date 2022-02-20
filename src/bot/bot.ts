import { Intents } from 'discord.js'
import 'dotenv/config'
import postgres from 'pg'
import { config } from '../config'
import prisma from '../db/dbClient'
import { BotBuilder } from './botBuilder'
import { isSummonerStats } from './helpers'

// Postgres client
const pg = new postgres.Client({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})
await pg.connect()

// Main function
const run = async () => {
    const builder = new BotBuilder()
    const client = await builder
        .setIntents([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES])
        .buildCommands('/commands')
        .buildEvents('/events')
        .build()

    client.login(config.BOT_TOKEN)
    console.log('Bot is running.')

    pg.on('notification', async data => {
        const payload = data.payload
        if (payload === undefined) return

        const stats = JSON.parse(payload)
        if (!isSummonerStats(stats)) {
            console.error('Unable to parse notification payload: ', stats)
            return
        }

        // const guilds = (
        //     await prisma.instance.guildFollowing.findMany({
        //         where: {
        //             puuid: stats.puuid
        //         },
        //         select: {
        //             guild: true
        //         }
        //     })
        // ).map(g => g.guild)
        const guilds = await prisma.instance.guild.findMany()

        const name = (
            await prisma.instance.summoner.findFirst({
                where: {
                    puuid: stats.puuid
                },
                select: {
                    name: true
                }
            })
        )?.name

        if (name === undefined) {
            console.error(`Could not find anme for ${stats.puuid}.`)
            return
        }

        guilds.forEach(async guild => {
            if (guild.channelId === null) return

            const channel = client.channels.cache.get(guild.channelId)
            if (channel === undefined || channel.type !== 'GUILD_TEXT') return
            await channel.send(`Big int by ${name} with ${stats.deaths} deaths.`)
        })
    })

    pg.query('LISTEN new_stats_event')
}

await run()
