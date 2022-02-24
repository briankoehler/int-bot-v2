import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
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
            return
        }

        const name = interaction.options.getString('name')

        // Check that name was specified
        if (name === null) {
            await interaction.reply('Summoner name not specified.')
            return
        }

        const testCount = await prisma.instance.guildFollowing.count({
            where: {
                guildId: interaction.guildId,
                summoner: { name }
            }
        })

        if (testCount === 0) {
            await interaction.reply('Summoner not followed.')
            return
        }

        await prisma.instance.guildFollowing.deleteMany({
            where: {
                guildId: interaction.guildId,
                summoner: { name }
            }
        })

        await interaction.reply('Summoner unfollowed.')
    }
}

export { unfollow as command }
