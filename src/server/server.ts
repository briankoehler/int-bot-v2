import pkg from '@prisma/client'
import express from 'express'
import schedule from 'node-schedule'
import { summoner } from './controllers/summoner'
import { Updater } from './updater/updater'

const { PrismaClient } = pkg
export const prisma = new PrismaClient()
const updater = new Updater()

const app = express()
app.use(express.json())
app.use('/summoner', summoner)

// Schedule data collection job
schedule.scheduleJob('*/5 * * * *', async () => {
    updater.update()
})

const server = app.listen(3000, () => {
    console.log(`Server listening on port 3000.`)
})

process.on('SIGTERM', () => {
    prisma.$disconnect()
    server.close(() => console.log('Server closed.'))
})