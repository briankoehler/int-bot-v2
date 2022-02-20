import { SummonerStats } from '@prisma/client'
import { isObject } from '../common/helpers'
import { Command, Event } from './types'

export const isCommand = (x: unknown): x is Command => {
    if (!isObject(x)) return false
    return 'data' in x && 'execute' in x && 'guildOnly' in x
}

export const isEvent = (x: unknown): x is Event => {
    if (!isObject(x)) return false
    return 'name' in x && 'once' in x && 'execute' in x
}

export const isSummonerStats = (x: unknown): x is SummonerStats => {
    const properties = [
        'id',
        'puuid',
        'match_id',
        'kills',
        'deaths',
        'assists',
        'champion',
        'position',
        'team',
        'total_time_dead',
        'challenges'
    ]
    if (!isObject(x)) return false
    if (!properties.every(p => p in x)) return false
    x.totalTimeDead = x.total_time_dead
    x.matchId = x.match_id
    return true
}
