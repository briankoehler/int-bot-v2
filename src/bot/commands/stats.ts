import { bold, SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const stats: Command = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get the stats of a summoner.')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('The summoner to get the stats of.')
                .setRequired(true)
        ),
    guildOnly: false,

    execute: async (interaction: CommandInteraction) => {
        const name = interaction.options.getString('name')

        // Check that name was specified
        if (name === null) {
            await interaction.reply('Summoner name not specified.')
            return { ok: false, value: Error('Summoner name not specified.') }
        }

        const dataOp = await performSafePrismaOperation(
            async () =>
                await prisma.instance.summonerStats.aggregate({
                    where: {
                        summoner: { name }
                    },
                    _sum: {
                        kills: true,
                        deaths: true,
                        assists: true,
                        totalTimeDead: true
                    }
                })
        )

        if (!dataOp.ok) {
            await interaction.reply(`Trouble getting stats for ${name}.`)
            return { ok: false, value: dataOp.value }
        }

        const matchCount = await prisma.instance.summonerStats.count({
            where: { summoner: { name } }
        })

        if (matchCount === 0) {
            await interaction.reply(`No matches found for ${name}.`)
            return { ok: true, value: null }
        }

        await interaction.reply(`
            ${bold(name + ' Stats:')}\n
            ${bold('Total Matches: ')} ${matchCount}
            ${bold('Total Time Spent Dead: ')} ${(dataOp.value._sum.totalTimeDead ?? 0) / 60} minutes
            
            ${bold('Total Kills:')} ${dataOp.value._sum.kills}
            ${bold('Total Deaths:')} ${dataOp.value._sum.deaths}
            ${bold('Total Assists:')} ${dataOp.value._sum.assists}
        `)

        return { ok: true, value: null }
    }
}

export { stats as command }
