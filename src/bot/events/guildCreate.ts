import { Guild } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import prisma from '../../db/dbClient'
import { Event } from '../types'

const guildCreate: Event = {
    name: 'guildCreate',
    once: false,

    execute: async (guild: unknown) => {
        if (!(guild instanceof Guild)) {
            console.error(`guildCreate event received non-guild: ${guild}`)
            return
        }

        const { id, name } = guild

        const result = await performSafePrismaOperation(async () => {
            return await prisma.instance.guild.create({ data: { id, name } })
        }, 'An error occurred when creating guild in database')

        if (!result.ok) console.error(`Failed to create guild in database: ${result.value}`)
    }
}

export { guildCreate as event }
