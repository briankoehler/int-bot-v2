import { SlashCommandBuilder } from '@discordjs/builders'
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
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return { ok: false, value: Error('Command must be used in a guild.') }
        }
        const { guildId } = interaction

        // Get desired summoner
        const name = interaction.options.getString('name')
        let puuid = ''

        // Check that name was specified
        if (name === null) {
            await interaction.reply('Summoner name not specified.')
            return { ok: false, value: Error('Summoner name not specified.') }
        }

        // Check if summoner PUUID is in database
        let result: { puuid: string } | null = null
        const puuidOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.summoner.findFirst({
                where: { name },
                select: { puuid: true }
            })
        }, 'An error occurred when checking if summoner is in database')

        if (!puuidOp.ok) return puuidOp

        result = puuidOp.value

        if (result !== null) {
            puuid = result.puuid

            // Check if summoner is already followed
            const followedOp = await performSafePrismaOperation(async () => {
                return await prisma.instance.guildFollowing.findFirst({
                    where: { puuid, guildId }
                })
            }, 'An error occurred when checking if summoner is followed')

            if (!followedOp.ok) return followedOp

            if (followedOp.value !== null) {
                await interaction.reply('Summoner is already followed.')
                return { ok: true, value: null }
            }

            // Follow summoner
            const followOp = await performSafePrismaOperation(
                async () =>
                    await prisma.instance.guildFollowing.create({
                        data: {
                            puuid,
                            guildId
                        }
                    }),
                'An error occurred when following summoner'
            )

            if (!followOp.ok) return followOp

            await interaction.reply(`Setting ${interaction.guild.name} to follow ${name}.`)
            return { ok: true, value: null }
        }

        // If summoner is not in database, get PUUID from Riot API
        const riot = new RiotApi(config.RIOT_TOKEN)
        puuid = handleResult(await riot.getSummoner(name)).puuid

        // Create summoner in database
        const createSummonerOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.summoner.create({ data: { name, puuid } })
        }, 'An error occurred when creating summoner in database')

        if (!createSummonerOp.ok) return createSummonerOp

        // Add following to db
        const createGuildFollowingOp = await performSafePrismaOperation(async () => {
            return await prisma.instance.guildFollowing.create({
                data: { guildId, puuid }
            })
        }, 'An error occurred when adding following to database')

        if (!createGuildFollowingOp.ok) return createGuildFollowingOp

        await interaction.reply(`Setting ${interaction.guild.name} to follow ${name}.`)
        return { ok: true, value: null }
    }
}

export { follow as command }
