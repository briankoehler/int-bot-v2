import express from 'express'
import prisma from '../../db/dbClient'

export const guildFollowing = express.Router()

guildFollowing.get('/all', async (req, res) => {
    const all = await prisma.instance.guildFollowing.findMany()
    res.status(200).send(all)
})

guildFollowing.delete('/all', async (req, res) => {
    await prisma.instance.guildFollowing.deleteMany()
    res.status(200).send()
})

guildFollowing.post('/', async (req, res) => {
    await prisma.instance.guildFollowing.create({
        data: {
            guildId: req.body.guildId,
            puuid: req.body.puuid
        }
    })
    res.status(201).send()
})

guildFollowing.delete('/:id', async (req, res) => {
    await prisma.instance.guildFollowing.delete({
        where: { id: req.params.id }
    })
    res.status(200).send()
})
