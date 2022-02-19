import { DataDragonResponse, RiotResponse } from './types'

export const isObject = (x: unknown): x is Record<string, unknown> => {
    return typeof x === 'object' && x !== null
}

export const isChampionResponse = (response: unknown): response is DataDragonResponse.ChampionResponse => {
    if (!isObject(response)) return false
    if (response.type !== 'champion') return false
    if (response.data === undefined) return false
    return true
}

export const isQueueResponse = (response: unknown): response is DataDragonResponse.QueueResponse => {
    const properties = ['queueId', 'map', 'description']
    if (!Array.isArray(response)) return false
    return properties.every(p => p in response[0])
}

export const isSummonerResponse = (response: unknown): response is RiotResponse.SummonerResponse => {
    if (!isObject(response)) return false
    const properties = ['id', 'accountId', 'puuid', 'name', 'profileIconId', 'revisionDate', 'summonerLevel']
    return properties.every(p => p in response)
}

export const isErrorResponse = (response: unknown): response is RiotResponse.ErrorResponse => {
    if (!isObject(response)) return false
    if (!isObject(response.status)) return false

    if (!('status' in response)) return false
    if ('message' in response.status && 'status_code' in response.status) return true
    return false
}

export const isMatchIdsResponse = (response: unknown): response is RiotResponse.MatchIdsResponse => {
    return Array.isArray(response) && response.every(id => typeof id === 'string')
}

export const isMatchResponse = (response: unknown): response is RiotResponse.MatchResponse => {
    if (!isObject(response)) return false
    if (!isObject(response.metadata)) return false
    
    if (!('metadata' in response) || !('info' in response)) return false
    if (!('matchId' in response.metadata) || !('participants' in response.metadata)) return false
    
    const properties = ['gameCreation', 'gameDuration', 'gameEndTimestamp', 'gameId', 'gameMode', 'gameStartTimestamp', 'gameType', 'gameVersion', 'mapId', 'participants', 'queueId']
    return properties.every(p => (isObject(response.info)) && p in response.info)
}
