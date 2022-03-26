import express from 'express'
import { performSafePrismaOperation } from '../../common/helpers'
import { prisma } from '../../db/dbClient'

export const guild = express.Router()

guild.get('/all', async (req, res) => {
    const all = await performSafePrismaOperation(async () => await prisma.guild.findMany())
    if (!all.ok) {
        res.sendStatus(500)
        return
    }
    res.status(200).send(all.value)
})

guild.delete('/all', async (req, res) => {
    const result = await performSafePrismaOperation(async () => await prisma.guild.deleteMany())
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})

guild.delete('/:guildId', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.guild.delete({
                where: { id: req.params.guildId }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})
