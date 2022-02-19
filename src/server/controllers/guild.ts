import express from 'express'
import prisma from '../../db/dbClient'

export const guild = express.Router()

guild.get('/all', async (req, res) => {
    const all = await prisma.instance.guild.findMany()
    res.status(200).send(all)
})

guild.delete('/all', async (req, res) => {
    await prisma.instance.guild.deleteMany()
    res.status(200).send()
})

guild.delete('/:guildId', async (req, res) => {
    await prisma.instance.guild.delete({
        where: { id: req.params.guildId }
    })
    res.status(200).send()
})
