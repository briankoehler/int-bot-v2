import express from 'express'
import { performSafePrismaOperation } from '../../common/helpers'
import { prisma } from '../../db/dbClient'

export const summonerStats = express.Router()

summonerStats.get('/all', async (req, res) => {
    const all = await performSafePrismaOperation(async () => await prisma.summonerStats.findMany())
    if (!all.ok) {
        res.sendStatus(500)
        return
    }
    res.status(200).send(all.value)
})

summonerStats.delete('/all', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () => await prisma.summonerStats.deleteMany()
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})

summonerStats.delete('/:id', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.summonerStats.delete({
                where: { id: req.params.id }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})
