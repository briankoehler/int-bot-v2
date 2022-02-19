import { Client, Collection, DMChannel, Intents } from 'discord.js'
import 'dotenv/config'
import fs from 'fs'
import { dirname } from 'path'
import postgres from 'pg'
import { fileURLToPath } from 'url'
import { config } from '../config'
import prisma from '../db/dbClient'
import { Command, isCommand } from './types'

// Discord client
export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})

// Postgres client
const pg = new postgres.Client({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})
await pg.connect()

// Construct commands
client.commands = new Collection()
const commandFiles = fs
    .readdirSync(`${dirname(fileURLToPath(import.meta.url))}/commands`)
    .filter(f => f.endsWith('.js'))

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`)
    if (!isCommand(command)) throw Error(`Command file not parsable: ${file}`)
    client.commands.set(command.data.name, command)
}

pg.on('notification', async data => {
    const payload = data.payload
    if (payload === undefined) return
    console.log('received notification', JSON.parse(payload))
})

client.on('guildCreate', async guild => {
    const { id, name } = guild
    try {
        await prisma.instance.guild.create({
            data: { id, name }
        })
    } catch (e) {
        console.error('An error occurred when joining a guild: ', e)
    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    const command: Command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
        if (command.guildOnly && interaction.channel instanceof DMChannel) {
            await interaction.reply('Command must be used in a guild.')
            return
        }
        await command.execute(interaction)
    } catch (e) {
        console.error('An error occurred: ', e)
    }
})

// Main function
const run = async () => {
    client.login(config.BOT_TOKEN)
    console.log('Bot is running.')

    pg.query('LISTEN new_stats_event')
}

await run()
