import { Guild } from 'discord.js'
import prisma from '../../db/dbClient'
import { Event } from '../types'

const guildCreate: Event = {
    name: 'guildCreate',
    once: false,

    execute: async (guild: unknown) => {
        if (!(guild instanceof Guild)) throw Error('Expected guild to be of type Guild.')

        const { id, name } = guild
        try {
            await prisma.instance.guild.create({
                data: { id, name }
            })
        } catch (e) {
            console.error('An error occurred when joining a guild: ', e)
        }
    }
}

export { guildCreate as event }
