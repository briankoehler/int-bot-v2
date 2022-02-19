import express from 'express'
import prisma from '../../db/dbClient'

export const summonerStats = express.Router()

summonerStats.get('/all', async (req, res) => {
    const all = await prisma.instance.summonerStats.findMany()
    res.status(200).send(all)
})

summonerStats.delete('/all', async (req, res) => {
    await prisma.instance.summonerStats.deleteMany()
    res.status(200).send()
})

summonerStats.delete('/:id', async (req, res) => {
    await prisma.instance.summonerStats.delete({
        where: { id: req.params.id }
    })
    res.status(200).send()
})
