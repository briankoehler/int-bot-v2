import express from 'express'
import { performSafePrismaOperation } from '../../common/helpers'
import { prisma } from '../../db/dbClient'

export const summoner = express.Router()

summoner.get('/all', async (req, res) => {
    const all = await performSafePrismaOperation(async () => await prisma.summoner.findMany())
    if (!all.ok) {
        res.sendStatus(500)
        return
    }
    res.status(200).send(all.value)
})

summoner.get('/:puuid', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.summoner.findFirst({
                where: {
                    puuid: req.params.puuid
                }
            })
    )

    if (!result.ok) {
        res.sendStatus(500)
        return
    }

    const first = result.value

    if (!first) {
        res.sendStatus(404)
        return
    }
    res.status(200).send(first)
})

summoner.post('/', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.summoner.create({
                data: {
                    puuid: req.body.puuid,
                    name: req.body.name
                }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.status(201).send()
})

summoner.delete('/:puuid', async (req, res) => {
    const result = await performSafePrismaOperation(
        async () =>
            await prisma.summoner.delete({
                where: {
                    puuid: req.params.puuid
                }
            })
    )
    if (!result.ok) {
        res.sendStatus(500)
        return
    }
    res.status(200).send()
})
