import schedule from 'node-schedule'
import { prisma } from '../db/dbClient'
import { app } from './app'
import { MatchUpdater } from './updater/matchUpdater'
import { SummonersUpdater } from './updater/summonersUpdater'

// Schedule match data collection job
await MatchUpdater.update()
schedule.scheduleJob('*/5 * * * *', async () => {
    await MatchUpdater.update()
})

// Schedule summoner update job
schedule.scheduleJob('0 0 * * *', async () => {
    await SummonersUpdater.update()
})

const server = app.listen(3000, () => {
    console.log('Server listening on port 3000.')
})

process.on('SIGTERM', () => {
    prisma.$disconnect()
    server.close(() => console.log('Server closed.'))
})
