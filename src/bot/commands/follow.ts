import { SlashCommandBuilder } from '@discordjs/builders'
import { Summoner } from '@prisma/client'
import { CommandInteraction } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import { RiotApi } from '../../common/riotApi'
import { handleResult } from '../../common/types/errors'
import { config } from '../../config'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const follow: Command = {
    data: new SlashCommandBuilder()
        .setName('follow')
        .setDescription('Follow a summoner.')
        .addStringOption(option =>
            option.setName('name').setDescription('The summoner to follow.').setRequired(true)
        ),
    guildOnly: true,

    execute: async (interaction: CommandInteraction) => {
        // Check that interaction was in a guild
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return { ok: false, value: Error('Command must be used in a guild.') }
        }
        const { guildId } = interaction

        // Get desired summoner
        const name = interaction.options.getString('name')
        let puuid = ''
        let realName = ''

        // Check that name was specified
        if (name === null) {
            await interaction.reply('Summoner name not specified.')
            return { ok: false, value: Error('Summoner name not specified.') }
        }

        // Check that summoner is in database
        const summonerOp = await checkDbForSummoner(name)
        if (!summonerOp.ok) return summonerOp

        // Get puuid from database or get from riot api
        if (summonerOp.value === null) {
            const riot = new RiotApi(config.RIOT_TOKEN)
            const summoner = handleResult(await riot.getSummoner(name))

            puuid = summoner.puuid
            realName = summoner.name

            // Add summoner to database
            const createSummonerOp = await createSummoner(puuid, realName)
            if (!createSummonerOp.ok) return createSummonerOp
        } else {
            puuid = summonerOp.value.puuid
            realName = summonerOp.value.name
        }

        // Check that summoner is followed by guild
        const followedOp = await checkGuildFollowsSummoner(puuid, guildId)
        if (!followedOp.ok) return followedOp
        if (followedOp.value !== null) {
            await interaction.reply('Summoner is already followed.')
            return { ok: true, value: null }
        }

        // Follow summoner
        const followOp = await followSummoner(puuid, guildId)
        if (!followOp.ok) return followOp

        await interaction.reply(`Setting ${interaction.guild.name} to follow ${realName}.`)
        return { ok: true, value: null }
    }
}

/**
 * Determine if summoner is in database by name.
 * @param name The summoner to check for in the database
 * @returns Result of whether summoner is in database
 */
const checkDbForSummoner = async (name: string) =>
    await performSafePrismaOperation(
        async () =>
            await prisma.instance.$queryRaw<Summoner>`
                SELECT * FROM summoner
                WHERE REPLACE(LOWER(name), ' ', '') = REPLACE(LOWER(${name}), ' ', '')
            `,
        'An error occurred when checking if summoner is in database'
    )

/**
 * Determine if summoner is followed by guild.
 * @param puuid The puuid of the summoner to check if followed
 * @param guildId The guild to check if following
 * @returns Result of whether summoner is followed
 */
const checkGuildFollowsSummoner = async (puuid: string, guildId: string) =>
    await performSafePrismaOperation(
        async () => await prisma.instance.guildFollowing.findFirst({ where: { puuid, guildId } }),
        'An error occurred when checking if summoner is followed'
    )

/**
 * Set guild to follow summoner.
 * @param puuid The puuid of the summoner to follow
 * @param guildId The ID of guild to follow summoner
 * @returns Result of whether summoner was followed
 */
const followSummoner = async (puuid: string, guildId: string) =>
    await performSafePrismaOperation(
        async () => await prisma.instance.guildFollowing.create({ data: { puuid, guildId } }),
        'An error occurred when following summoner'
    )

/**
 * Add a summoner to the database.
 * @param puuid Puuid of summoner to create
 * @param name Name of summoner to create
 * @returns Whether summoner was created
 */
const createSummoner = async (puuid: string, name: string) =>
    await performSafePrismaOperation(
        async () => await prisma.instance.summoner.create({ data: { puuid, name } }),
        'An error occurred when creating summoner'
    )

export { follow as command }
