import express from 'express'
import { prisma } from '../../db/dbClient'

export const match = express.Router()

match.get('/all', async (req, res) => {
    const all = await prisma.match.findMany()
    res.status(200).send(all)
})

match.delete('/all', async (req, res) => {
    await prisma.match.deleteMany()
    res.status(200).send()
})

match.delete('/:matchId', async (req, res) => {
    await prisma.match.delete({
        where: { matchId: req.params.matchId }
    })
    res.status(200).send()
})
