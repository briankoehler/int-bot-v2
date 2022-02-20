import { Intents } from 'discord.js'
import 'dotenv/config'
import postgres from 'pg'
import { config } from '../config'
import { BotBuilder } from './botBuilder'

// Postgres client
const pg = new postgres.Client({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})
await pg.connect()

pg.on('notification', async data => {
    const payload = data.payload
    if (payload === undefined) return
    console.log('received notification', JSON.parse(payload))
})

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

    pg.query('LISTEN new_stats_event')
}

await run()
