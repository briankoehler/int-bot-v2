import pkg from '@prisma/client'
import { Intents } from 'discord.js'
import { Client } from 'discordx'
import 'dotenv/config'
import postgres from 'pg'
import { config } from '../config'

// Discord client
export const client = new Client({
    botId: 'int-bot-v2',
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

// Prisma client
const { PrismaClient } = pkg
export const prisma = new PrismaClient()

// Postgres client
const pg = new postgres.Client({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})
await pg.connect()

// Event handlers
client.on('ready', async () => {
    await client.initApplicationCommands()
    await client.initApplicationPermissions()
})

pg.on('notification', async (data) => {
    const payload = data.payload
    if (payload === undefined) return
    console.log('received notification', JSON.parse(payload))
})

// Main function
const run = async () => {
    client.login(config.BOT_TOKEN)
    console.log('Bot is running.')

    pg.query('LISTEN new_stats_event')
}

await run()
