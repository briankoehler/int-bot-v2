import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import 'dotenv/config'
import { config } from '../config'

const rest = new REST({ version: '9' }).setToken(config.BOT_TOKEN)

const body = [
    new SlashCommandBuilder()
        .setName('here')
        .setDescription('Sets the notification channel for this guild.'),
].map(command => command.toJSON())

await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body })
