import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { Command, isCommand, isEvent } from '../../../src/common/types/bot'
import { Result } from '../../../src/common/types/errors'

describe('isCommand', () => {
    it('succeeds on real command', () => {
        const validCommand: Command = {
            data: new SlashCommandBuilder(),
            guildOnly: false,
            execute: function (
                interaction: CommandInteraction<CacheType>
            ): Promise<Result<null, Error>> {
                console.log(interaction)
                throw new Error('Function not implemented.')
            }
        }

        expect(isCommand(validCommand)).toBe(true)
    })

    it('fails on bad execute function', () => {
        const invalidCommand = {
            data: new SlashCommandBuilder(),
            guildOnly: false,
            execute: 'not a function'
        }

        expect(isCommand(invalidCommand)).toBe(false)
    })

    it('fails on bad guildOnly', () => {
        const invalidCommand = {
            data: new SlashCommandBuilder(),
            guildOnly: 'not a boolean',
            execute: function (
                interaction: CommandInteraction<CacheType>
            ): Promise<Result<null, Error>> {
                console.log(interaction)
                throw new Error('Function not implemented.')
            }
        }

        expect(isCommand(invalidCommand)).toBe(false)
    })

    it('fails on bad data', () => {
        const invalidCommand = {
            data: 'not an object',
            guildOnly: false,
            execute: function (
                interaction: CommandInteraction<CacheType>
            ): Promise<Result<null, Error>> {
                console.log(interaction)
                throw new Error('Function not implemented.')
            }
        }

        expect(isCommand(invalidCommand)).toBe(false)
    })

    it('fails on non-object', () => {
        const invalidCommand = 'not an object'
        expect(isCommand(invalidCommand)).toBe(false)
    })
})

describe('isEvent', () => {
    it('succeeds on real event', () => {
        const validEvent = {
            name: 'test',
            once: false,
            execute: function (...x: unknown[]): Promise<void> {
                console.log(x)
                throw new Error('Function not implemented.')
            }
        }

        expect(isEvent(validEvent)).toBe(true)
    })

    it('fails on empty name', () => {
        const invalidEvent = {
            name: '',
            once: false,
            execute: function (...x: unknown[]): Promise<void> {
                console.log(x)
                throw new Error('Function not implemented.')
            }
        }

        expect(isEvent(invalidEvent)).toBe(false)
    })

    it('fails on null name', () => {
        const invalidEvent = {
            name: null,
            once: false,
            execute: function (...x: unknown[]): Promise<void> {
                console.log(x)
                throw new Error('Function not implemented.')
            }
        }

        expect(isEvent(invalidEvent)).toBe(false)
    })

    it('fails on bad once', () => {
        const invalidEvent = {
            name: 'test',
            once: 'not a boolean',
            execute: function (...x: unknown[]): Promise<void> {
                console.log(x)
                throw new Error('Function not implemented.')
            }
        }

        expect(isEvent(invalidEvent)).toBe(false)
    })

    it('fails on bad execute function', () => {
        const invalidEvent = {
            name: 'test',
            once: false,
            execute: 'not a function'
        }

        expect(isEvent(invalidEvent)).toBe(false)
    })

    it('fails on non-object', () => {
        const invalidEvent = 'not an object'
        expect(isEvent(invalidEvent)).toBe(false)
    })
})
