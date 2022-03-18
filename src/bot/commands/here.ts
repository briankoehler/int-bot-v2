import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import { Command } from '../../common/types/bot'
import { prisma } from '../../db/dbClient'

const here: Command = {
    data: new SlashCommandBuilder()
        .setName('here')
        .setDescription("Sets the guild's notification channel."),
    guildOnly: true,

    execute: async (interaction: CommandInteraction<CacheType>) => {
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return { ok: false, value: Error('Command must be used in a guild.') }
        }
        const id = interaction.guildId

        const updateOp = await performSafePrismaOperation(async () => {
            return await prisma.guild.update({
                where: { id },
                data: { channelId: interaction.channelId }
            })
        })

        if (!updateOp.ok) return updateOp

        await interaction.reply(`Setting notification channel for ${interaction.guild.name}.`)
        return { ok: true, value: null }
    }
}

export { here as command }
