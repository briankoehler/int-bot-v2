import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Formatters } from 'discord.js'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const list: Command = {
    data: new SlashCommandBuilder().setName('list').setDescription('List followed summoners.'),
    guildOnly: true,

    execute: async (interaction: CommandInteraction) => {
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return
        }

        const summoners = (
            await prisma.instance.guildFollowing.findMany({
                where: { guildId: interaction.guildId },
                select: { summoner: true }
            })
        ).map(s => s.summoner)

        if (summoners.length === 0) {
            await interaction.reply('No summoners followed.')
            return
        }

        await interaction.reply(
            `\n${Formatters.bold('Followed Summoners:')}\n${summoners.join('\n')}`
        )
    }
}

export { list as command }
