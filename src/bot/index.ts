import pkg from '@prisma/client'
import { Client, Intents } from 'discord.js'
import 'dotenv/config'
import postgres from 'pg'
import { config } from '../config'

// Discord client
export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
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

pg.on('notification', async data => {
    const payload = data.payload
    if (payload === undefined) return
    console.log('received notification', JSON.parse(payload))
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    const { commandName } = interaction

    switch (commandName) {
        case 'here':
            await interaction.reply(`message received at channel ${interaction.channelId}.`)
            break
        default:
            console.log('Unrecognized command.')
    }
})

// Main function
const run = async () => {
    client.login(config.BOT_TOKEN)
    console.log('Bot is running.')

    pg.query('LISTEN new_stats_event')
}

await run()
