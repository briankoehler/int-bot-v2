import express from 'express'
import { prisma } from '../../db/dbClient'

export const guild = express.Router()

guild.get('/all', async (req, res) => {
    const all = await prisma.guild.findMany()
    res.status(200).send(all)
})

guild.delete('/all', async (req, res) => {
    await prisma.guild.deleteMany()
    res.status(200).send()
})

guild.delete('/:guildId', async (req, res) => {
    await prisma.guild.delete({
        where: { id: req.params.guildId }
    })
    res.status(200).send()
})
