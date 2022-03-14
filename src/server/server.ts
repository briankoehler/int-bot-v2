import express from 'express'
import schedule from 'node-schedule'
import prisma from '../db/dbClient'
import { guild, guildFollowing, match, summoner, summonerStats } from './controllers'
import { Updater } from './updater/updater'

const app = express()
app.use(express.json())
app.use('/summoner', summoner)
app.use('/summonerstats', summonerStats)
app.use('/match', match)
app.use('/guild', guild)
app.use('/guildfollowing', guildFollowing)

// Schedule data collection job
await Updater.update()
schedule.scheduleJob('*/5 * * * *', async () => {
    await Updater.update()
})

const server = app.listen(3000, () => {
    console.log('Server listening on port 3000.')
})

process.on('SIGTERM', () => {
    prisma.instance.$disconnect()
    server.close(() => console.log('Server closed.'))
})
