import { bold, SlashCommandBuilder } from '@discordjs/builders'
import { SummonerStats } from '@prisma/client'
import { CacheType, CommandInteraction } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import { handleResult, Result } from '../../common/types/errors'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const leaderboard: Command = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Get the top ints of your guild.'),
    guildOnly: true,

    execute: async (interaction: CommandInteraction<CacheType>) => {
        const guildId = interaction.guildId

        if (!guildId) {
            await interaction.reply('This command is only available in guilds.')
            return { ok: true, value: null }
        }

        const puuids = handleResult(await fetchPuuids(interaction, guildId))
        const stats = handleResult(await fetchTopStats(interaction, puuids))

        await interaction.reply(`${bold('Int Leaderboard:')}\n\n${stats
            .map(
                (stat, i) =>
                    `${bold(`${i + 1})`)} ${stat.summoner.name} - ${stat.kills}/${stat.deaths}/${
                        stat.assists
                    } (${stat.champion})`
            )
            .join('\n')}
        `)

        return { ok: true, value: null }
    }
}

const fetchPuuids = async (
    interaction: CommandInteraction,
    guildId: string
): Promise<Result<string[]>> => {
    const dataOp = await performSafePrismaOperation(
        async () =>
            await prisma.instance.guildFollowing.findMany({
                where: { guildId },
                select: { puuid: true }
            })
    )

    if (!dataOp.ok) {
        interaction.reply('Error getting leaderboard.')
        return { ok: false, value: Error('Error getting PUUIDs.') }
    }

    return { ok: true, value: dataOp.value.map(({ puuid }) => puuid) }
}

const fetchTopStats = async (
    interaction: CommandInteraction,
    puuids: string[]
): Promise<
    Result<
        (SummonerStats & {
            summoner: { name: string }
        })[]
    >
> => {
    const dataOp = await performSafePrismaOperation(
        async () =>
            await prisma.instance.summonerStats.findMany({
                take: 10,
                where: { puuid: { in: puuids } },
                orderBy: { deaths: 'desc' },
                include: {
                    summoner: {
                        select: {
                            name: true
                        }
                    }
                }
            })
    )

    if (!dataOp.ok) {
        interaction.reply('Error getting leaderboard.')
        return { ok: false, value: Error('Error getting leaderboard.') }
    }

    return { ok: true, value: dataOp.value }
}

export { leaderboard as command }
