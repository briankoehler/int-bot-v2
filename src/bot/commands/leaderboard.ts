import { bold, SlashCommandBuilder } from '@discordjs/builders'
import pkg from '@prisma/client'
import { CacheType, CommandInteraction } from 'discord.js'
import { isObject, performSafePrismaOperation } from '../../common/helpers'
import { Command } from '../../common/types/bot'
import { handleResult, Result } from '../../common/types/errors'
import { prisma } from '../../db/dbClient'

interface LeaderboardStat {
    name: string
    champion: string
    kills: number
    deaths: number
    assists: number
}

const { Prisma } = pkg

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

        // Fetch data
        const puuids = handleResult(await fetchPuuids(interaction, guildId))
        const stats = handleResult(await fetchTopStats(interaction, puuids))

        await interaction.reply(`_ _\n_ _\n${bold('INT LEADERBOARD\n--------------------')}\n${stats
            .map(
                (stat, i) =>
                    `${bold(`${i + 1})`)} ${stat.kills}/${stat.deaths}/${stat.assists} - ${
                        stat.name
                    } (${stat.champion})`
            )
            .join('\n')}\n_ _
        `)

        return { ok: true, value: null }
    }
}

/**
 * Fetch all PUUIDs that a guild is interested in.
 * @param interaction CommandInteraction that invoked the command
 * @param guildId Guild ID of the guild that invoked the command
 * @returns PUUIDs of summoners followed by guild
 */
const fetchPuuids = async (
    interaction: CommandInteraction,
    guildId: string
): Promise<Result<string[]>> => {
    const dataOp = await performSafePrismaOperation(
        async () =>
            await prisma.guildFollowing.findMany({
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

/**
 * Fetch the top stats for a given list of PUUIDs.
 * @param interaction CommandInteraction that invoked the command
 * @param puuids PUUIDs of summoners to fetch stats for
 * @returns Top 10 ints
 */
const fetchTopStats = async (
    interaction: CommandInteraction,
    puuids: string[]
): Promise<Result<LeaderboardStat[]>> => {
    const dataOp = await performSafePrismaOperation(
        async () =>
            await prisma.$queryRaw`
                SELECT summoner_stats.*, summoner.name FROM summoner_stats
                INNER JOIN summoner ON summoner.puuid = summoner_stats.puuid
                INNER JOIN match ON match.match_id = summoner_stats.match_id
                WHERE summoner_stats.puuid IN (${Prisma.join(puuids)})
                    AND match.queue IN ('5v5 Draft Pick games', '5v5 Ranked Solo games', '5v5 Ranked Flex games', 'Clash games')
                    AND (
                        ((summoner_stats.kills * 2 + summoner_stats.assists) / (summoner_stats.deaths * 2) < 1.3 AND summoner_stats.deaths - summoner_stats.kills > 2 AND summoner_stats.deaths > 3)
                        AND NOT (summoner_stats.deaths < 6 AND summoner_stats.kills + summoner_stats.assists > 3)
                        AND NOT (summoner_stats.deaths < 10 AND summoner_stats.kills > 2 AND summoner_stats.kills + summoner_stats.assists > 7)
                    )
                ORDER BY summoner_stats.deaths DESC, summoner_stats.kills ASC, summoner_stats.assists ASC
                LIMIT 10
            `
    )

    if (!dataOp.ok) {
        interaction.reply('Error getting leaderboard.')
        return { ok: false, value: Error('Error getting leaderboard.') }
    }

    if (Array.isArray(dataOp.value) && dataOp.value.every(isLeaderboardInfo)) {
        return { ok: true, value: dataOp.value }
    }

    interaction.reply('Error getting leaderboard.')
    return { ok: false, value: Error('Unable to parse result from database query.') }
}

const isLeaderboardInfo = (x: unknown): x is LeaderboardStat => {
    if (!isObject(x)) return false
    return (
        x.name !== undefined &&
        typeof x.name === 'string' &&
        x.champion !== undefined &&
        typeof x.champion === 'string' &&
        x.kills !== undefined &&
        typeof x.kills === 'number' &&
        x.deaths !== undefined &&
        typeof x.deaths === 'number' &&
        x.assists !== undefined &&
        typeof x.assists === 'number'
    )
}

export { leaderboard as command }
