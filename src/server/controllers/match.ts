import express from 'express'
import { performSafePrismaOperation } from '../../common/helpers'
import { prisma } from '../../db/dbClient'

export const match = express.Router()

match.get('/all', async (req, res) => {
    const all = await performSafePrismaOperation(async () => await prisma.match.findMany())
    if (!all.ok) {
        res.sendStatus(500)
        return
    }
    res.status(200).send(all.value)
})

match.delete('/all', async (req, res) => {
    const result = await performSafePrismaOperation(async () => await prisma.match.deleteMany())
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})

match.delete('/:matchId', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.match.delete({
                where: { matchId: req.params.matchId }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.sendStatus(200)
})
