import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { Command, isCommand } from '../../../src/common/types/bot'
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
})
