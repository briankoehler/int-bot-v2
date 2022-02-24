import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'

export interface Command {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    guildOnly: boolean
    execute: (interaction: CommandInteraction<CacheType>) => Promise<void>
}

export interface Event {
    name: string
    once: boolean
    execute: (...x: unknown[]) => Promise<void>
}