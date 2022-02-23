import { SlashCommandBuilder } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import { RiotApi } from '../../common/riotApi'
import { config } from '../../config'
import prisma from '../../db/dbClient'
import { Command } from '../types'

const follow: Command = {
    data: new SlashCommandBuilder()
        .setName('follow')
        .setDescription("Follow a summoner.").addStringOption(option =>
            option.setName('name')
                .setDescription('The summoner to follow.')
                .setRequired(true)),
    guildOnly: true,

    execute: async (interaction: CommandInteraction<CacheType>) => {
        if (interaction.guildId === null || interaction.guild === null) {
            await interaction.reply('Command must be used in a guild.')
            return
        }

        // Get desired summoner
        const name = interaction.options.getString('name')
        let puuid = ''

        // Check that name was specified
        if (name === null) {
            await interaction.reply('Summoner name not specified.')
            return
        }

        // Check if summoner PUUID is in database
        let result: { puuid: string } | null = null
        try {
            result = await prisma.instance.summoner.findFirst({
                where: { name },
                select: { puuid: true }
            })
        }
        catch (e) {
            console.error('An error occurred when checking for summoner PUUID in database: ', e)
            return
        }

        if (result !== null) {
            puuid = result.puuid

            try {
                // Check if summoner is already followed
                const test = await prisma.instance.guildFollowing.findFirst({
                    where: { puuid, guildId: interaction.guildId }
                })

                // If summoner is already followed, don't follow again
                if (test !== null) {
                    await interaction.reply('Summoner already followed.')
                    return
                }
            }
            catch (e) {
                console.error('Error checking if summoner is already followed: ', e)
                return
            }
        }
        else {
            // If summoner is not in database, get PUUID from Riot API
            const riot = new RiotApi(config.RIOT_TOKEN)
            puuid = await riot.getPuuid(name)

            try {
                await prisma.instance.summoner.create({
                    data: { name, puuid }
                })
            }
            catch (e) {
                console.error('Error creating summoner in database: ', e)
            }

            // Add following to db
            try {
                await prisma.instance.guildFollowing.create({
                    data: {
                        guildId: interaction.guildId,
                        puuid: puuid
                    }
                })
            }
            catch (e) {
                console.error('Error adding following to database: ', e)
                return
            }

            await interaction.reply(`Setting ${interaction.guild.name} to follow ${name}.`)
        }
    }
}

export { follow as command }

