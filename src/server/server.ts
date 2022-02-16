import pkg from '@prisma/client'
import express from 'express'
import { match } from './controllers/match'
import { summoner } from './controllers/summoner'
import { summonerStats } from './controllers/summonerStats'
import { Updater } from './updater/updater'

const { PrismaClient } = pkg
export const prisma = new PrismaClient()
const updater = new Updater()

const app = express()
app.use(express.json())
app.use('/summoner', summoner)
app.use('/summonerstats', summonerStats)
app.use('/match', match)

// Schedule data collection job
// schedule.scheduleJob('*/5 * * * *', async () => {
await updater.update()
// })

const server = app.listen(3000, () => {
    console.log(`Server listening on port 3000.`)
})

process.on('SIGTERM', () => {
    prisma.$disconnect()
    server.close(() => console.log('Server closed.'))
})