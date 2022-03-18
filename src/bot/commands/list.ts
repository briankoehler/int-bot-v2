import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Formatters } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import { Command } from '../../common/types/bot'
import { prisma } from '../../db/dbClient'

const list: Command = {
    data: new SlashCommandBuilder().setName('list').setDescription('List followed summoners.'),
    guildOnly: true,

    execute: async (interaction: CommandInteraction) => {
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return { ok: false, value: Error('Command must be used in a guild.') }
        }
        const guildId = interaction.guildId

        const summonersOp = await performSafePrismaOperation(async () => {
            return await prisma.guildFollowing.findMany({
                where: { guildId },
                select: { summoner: true }
            })
        })

        if (!summonersOp.ok) return summonersOp

        const summoners = summonersOp.value.map(s => s.summoner)

        if (summoners.length === 0) {
            await interaction.reply('No summoners followed.')
            return { ok: false, value: Error('No summoners followed.') }
        }

        await interaction.reply(
            `${Formatters.bold('Followed Summoners:')}\n${summoners.map(s => s.name).join('\n')}`
        )
        return { ok: true, value: null }
    }
}

export { list as command }
