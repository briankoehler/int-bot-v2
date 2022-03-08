import { Guild } from 'discord.js'
import { performSafePrismaOperation } from '../../common/helpers'
import prisma from '../../db/dbClient'
import { Event } from '../types'

const guildCreate: Event = {
    name: 'guildCreate',
    once: false,

    execute: async (guild: unknown) => {
        if (!(guild instanceof Guild))
            return { ok: false, value: Error('Event must be called with a guild.') }

        const { id, name } = guild

        const result = await performSafePrismaOperation(async () => {
            return await prisma.instance.guild.create({ data: { id, name } })
        }, 'An error occurred when creating guild in database')

        if (!result.ok) return result
        return { ok: true, value: null }
    }
}

export { guildCreate as event }
