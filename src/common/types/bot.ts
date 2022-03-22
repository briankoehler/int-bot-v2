import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { isObject } from '../helpers'
import { Result } from './errors'

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

export const isCommand = (x: unknown): x is Command => {
    if (!isObject(x)) return false
    return (
        'data' in x &&
        'execute' in x &&
        'guildOnly' in x &&
        typeof x.execute === 'function' &&
        typeof x.guildOnly === 'boolean' &&
        isObject(x.data)
    )
}

export const isEvent = (x: unknown): x is Event => {
    if (!isObject(x)) return false
    return (
        'name' in x &&
        'once' in x &&
        'execute' in x &&
        typeof x.execute === 'function' &&
        typeof x.name === 'string' &&
        typeof x.once === 'boolean' &&
        x.name.length > 0
    )
}

export const isTemplatesDoc = (x: unknown): x is TemplatesDoc => {
    return isObject(x) && x.ints !== undefined
}
