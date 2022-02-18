import express from 'express'
import { prisma } from '../server'

export const summoner = express.Router()

summoner.get('/all', async (req, res) => {
    const all = await prisma.summoner.findMany()
    res.status(200).send(all)
})

summoner.get('/:puuid', async (req, res) => {
    const first = await prisma.summoner.findFirst({
        where: {
            puuid: req.params.puuid
        }
    })
    if (first === null) {
        res.sendStatus(404)
        return
    }
    res.status(200).send(first)
})

summoner.post('/', async (req, res) => {
    await prisma.summoner.create({
        data: {
            puuid: req.body.puuid,
            name: req.body.name
        }
    })
    res.status(201).send()
})

summoner.delete('/:puuid', async (req, res) => {
    await prisma.summoner.delete({
        where: {
            puuid: req.params.puuid
        }
    })
    res.status(200).send()
})