import { bold, SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import { Result } from '../../common/types/errors'
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

        const nameOp = await performSafePrismaOperation(async () =>
            prisma.instance.summoner.findFirst({
                where: { name: { equals: name, mode: 'insensitive' } },
                rejectOnNotFound: true
            })
        )

        if (!nameOp.ok) {
            await interaction.reply('Summoner not found.')
            return { ok: true, value: null }
        }

        const realName = nameOp.value.name

        const dataOp = await performSafePrismaOperation(
            async () =>
                await prisma.instance.summonerStats.aggregate({
                    where: {
                        summoner: { name: { equals: name, mode: 'insensitive' } },
                        match: {
                            queue: {
                                in: [
                                    '5v5 Draft Pick games',
                                    '5v5 Ranked Solo games',
                                    '5v5 Ranked Flex games',
                                    'Clash games'
                                ]
                            }
                        }
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
            where: {
                summoner: { name: { equals: name, mode: 'insensitive' } },
                match: {
                    queue: {
                        in: [
                            '5v5 Draft Pick games',
                            '5v5 Ranked Solo games',
                            '5v5 Ranked Flex games',
                            'Clash games'
                        ]
                    }
                }
            }
        })

        const playtimeOp = await getTotalPlaytime(nameOp.value.puuid)
        if (!playtimeOp.ok) {
            await interaction.reply(`Trouble getting playtime for ${name}.`)
            return playtimeOp
        }
        const playtime = playtimeOp.value / 60

        const data = {
            'Total Matches': matchCount,
            'Total Playtime': `${playtime.toFixed(2)} minutes`,
            'Total Time Spent Dead': `${((dataOp.value._sum.totalTimeDead ?? 0) / 60).toFixed(
                2
            )} minutes`,

            'Total Kills': dataOp.value._sum.kills ?? 0,
            'Total Deaths': dataOp.value._sum.deaths ?? 0,
            'Total Assists': dataOp.value._sum.assists ?? 0,

            'Minutes per Death': `${(playtime / (dataOp.value._sum.deaths ?? 0)).toFixed(
                2
            )} minutes`,
            'Percentage Time Spend Dead': `${(
                (dataOp.value._sum.totalTimeDead ?? 0) / playtime
            ).toFixed(2)}%`
        }

        await interaction.reply(`_ _\n_ _\n${bold(`${realName} Stats`)}\n_ _\n${Object.entries(data)
            .map((e, i) => `${bold(`${e[0]}:`)} ${e[1]}${[2, 5].includes(i) ? '\n' : ''}`)
            .join('\n')}
            _ _
        `)

        return { ok: true, value: null }
    }
}

const getTotalPlaytime = async (puuid: string): Promise<Result<number>> => {
    const playtimeOp = await performSafePrismaOperation(async () =>
        prisma.instance.summonerStats.findMany({
            where: {
                summoner: { puuid },
                match: {
                    queue: {
                        in: [
                            '5v5 Draft Pick games',
                            '5v5 Ranked Solo games',
                            '5v5 Ranked Flex games',
                            'Clash games'
                        ]
                    }
                }
            }
        })
    )
    if (!playtimeOp.ok) return playtimeOp

    const matchIds = playtimeOp.value.map(e => e.matchId)

    const matchOp = await performSafePrismaOperation(async () =>
        prisma.instance.match.findMany({ where: { matchId: { in: matchIds } } })
    )
    if (!matchOp.ok) return matchOp

    return { ok: true, value: matchOp.value.reduce((acc, e) => acc + e.duration, 0) }
}

export { stats as command }
