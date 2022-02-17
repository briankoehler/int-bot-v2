import { RiotResponse } from './riotResponses'

export const isSummonerResponse = (response: any): response is RiotResponse.SummonerResponse => {
    const properties = ['id', 'accountId', 'puuid', 'name', 'profileIconId', 'revisionDate', 'summonerLevel']
    return properties.every(p => p in response)
}

export const isErrorResponse = (response: any): response is RiotResponse.ErrorResponse => {
    if (!('status' in response)) return false
    if ('message' in response.status && 'status_code' in response.status) return true
    return false
}

export const isMatchIdsResponse = (response: any): response is RiotResponse.MatchIdsResponse => {
    return Array.isArray(response) && response.every(id => typeof id === 'string')
}

export const isMatchResponse = (response: any): response is RiotResponse.MatchResponse => {
    if (!('metadata' in response) || !('info' in response)) return false
    if (!('matchId' in response.metadata) || !('participants' in response.metadata)) return false

    const properties = ['gameCreation', 'gameDuration', 'gameEndTimestamp', 'gameId', 'gameMode', 'gameStartTimestamp', 'gameType', 'gameVersion', 'mapId', 'participants']
    return properties.every(p => p in response.info)
}
