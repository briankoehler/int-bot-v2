import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { Result } from '../common/types/errors'

export interface Command {
    data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    guildOnly: boolean
    execute: (interaction: CommandInteraction<CacheType>) => Promise<Result<null>>
}

export interface Event {
    name: string
    once: boolean
    execute: (...x: unknown[]) => Promise<void>
}

export interface TemplatesDoc {
    ints: {
        [key: string]: string[]
    }
}
