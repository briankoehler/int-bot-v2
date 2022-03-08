import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const unfollow: Command = {
    data: new SlashCommandBuilder()
        .setName('unfollow')
        .setDescription('Unfollow a summoner.')
        .addStringOption(option =>
            option.setName('name').setDescription('The summoner to unfollow.').setRequired(true)
        ),
    guildOnly: true,

    execute: async (interaction: CommandInteraction) => {
        if (!interaction.inGuild()) {
            await interaction.reply('Command must be used in a guild.')
            return { ok: false, value: Error('Command must be used in a guild.') }
        }
        const guildId = interaction.guildId

        const name = interaction.options.getString('name')

        // Check that name was specified
        if (name === null) {
            await interaction.reply('Summoner name not specified.')
            return { ok: false, value: Error('Summoner name not specified.') }
        }

        const testCount = await prisma.instance.guildFollowing.count({
            where: {
                guildId: interaction.guildId,
                summoner: { name }
            }
        })

        if (testCount === 0) {
            await interaction.reply('Summoner not followed.')
            return { ok: false, value: Error('Summoner not followed.') }
        }

        const deleteOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.guildFollowing.deleteMany({
                where: { guildId, summoner: { name } }
            })
        })

        if (!deleteOp.ok) return deleteOp

        await interaction.reply('Summoner unfollowed.')
        return { ok: true, value: null }
    }
}

export { unfollow as command }
