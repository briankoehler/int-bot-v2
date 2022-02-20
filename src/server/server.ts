import express from 'express'
import prisma from '../db/dbClient'
import { guild } from './controllers/guild'
import { match } from './controllers/match'
import { summoner } from './controllers/summoner'
import { summonerStats } from './controllers/summonerStats'
import { Updater } from './updater/updater'

const app = express()
app.use(express.json())
app.use('/summoner', summoner)
app.use('/summonerstats', summonerStats)
app.use('/match', match)
app.use('/guild', guild)

// Schedule data collection job
// schedule.scheduleJob('*/5 * * * *', async () => {
await Updater.update()
// })

const server = app.listen(3000, () => {
    console.log('Server listening on port 3000.')
})

process.on('SIGTERM', () => {
    prisma.instance.$disconnect()
    server.close(() => console.log('Server closed.'))
})
