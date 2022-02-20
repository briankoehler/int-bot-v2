import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const here: Command = {
    data: new SlashCommandBuilder()
        .setName('here')
        .setDescription("Sets the guild's notification channel."),
    guildOnly: true,

    execute: async (interaction: CommandInteraction<CacheType>) => {
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return
        }

        await prisma.instance.guild.update({
            where: { id: interaction.guildId },
            data: { channelId: interaction.channelId }
        })
        await interaction.reply(`Setting notification channel for ${interaction.guild.name}.`)
    }
}

export { here as command }
