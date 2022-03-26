import express from 'express'
import { performSafePrismaOperation } from '../../common/helpers'
import { prisma } from '../../db/dbClient'

export const guildFollowing = express.Router()

guildFollowing.get('/all', async (req, res) => {
    const all = await performSafePrismaOperation(async () => await prisma.guildFollowing.findMany())
    if (!all.ok) {
        res.sendStatus(500)
        return
    }
    res.status(200).send(all.value)
})

guildFollowing.delete('/all', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () => await prisma.guildFollowing.deleteMany()
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})

guildFollowing.post('/', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.guildFollowing.create({
                data: {
                    guildId: req.body.guildId,
                    puuid: req.body.puuid
                }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(201)
})

guildFollowing.delete('/:id', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.guildFollowing.delete({
                where: { id: req.params.id }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})
