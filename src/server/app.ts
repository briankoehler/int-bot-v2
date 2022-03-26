import express from 'express'
import { guild, guildFollowing, match, summoner, summonerStats } from './controllers'

export const app = express()

app.use(express.json())
app.use('/summoner', summoner)
app.use('/summonerstats', summonerStats)
app.use('/match', match)
app.use('/guild', guild)
app.use('/guildfollowing', guildFollowing)
