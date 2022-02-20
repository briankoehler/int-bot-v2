import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import 'dotenv/config'
import fs from 'fs'
import { config } from '../config'
import { isCommand } from './helpers'

const rest = new REST({ version: '9' }).setToken(config.BOT_TOKEN)

const commands: unknown[] = []
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'))

commandFiles.forEach(async file => {
    const command = await import(`./commands/${file}`)
    if (!isCommand(command)) throw Error(`Command file not parsable: ${file}`)
    commands.push(command.data.toJSON())
})

await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands })
