import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { isObject } from '../server/updater/helpers'

export interface Command {
    data: SlashCommandBuilder
    guildOnly?: boolean
    execute: (interaction: CommandInteraction<CacheType>) => Promise<void>
}

export const isCommand = (x: unknown): x is Command => {
    if (!isObject(x)) return false
    if ('data' in x && 'execute' in x) return true
    return false
}
