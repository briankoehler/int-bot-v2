import axios from 'axios'
import { ErrorResponse, MatchIdsResponse, MatchResponse, SummonerResponse } from './riotResponses'

export const convertQueueIdToNameAndMap = async (id: number): Promise<[string, string]> => {
    const data: any[] = (await axios.get('https://static.developer.riotgames.com/docs/lol/queues.json')).data

    for (const d of data) {
        if (d.queueId === id) return [d.description, d.map]
    }

    throw Error('Unable to parse queue ID.')
}

export const convertChampionIdToName = async (id: number): Promise<string> => {
    const data = (await axios.get('http://ddragon.leagueoflegends.com/cdn/12.4.1/data/en_US/champion.json')).data.data

    for (const champion in data) {
        if (Number(data[champion].key) === id) return data[champion].name
    }

    throw Error(`Unable to parse champion ID: ${id}`)
}

export const isSummonerResponse = (response: any): response is SummonerResponse => {
    const properties = ['id', 'accountId', 'puuid', 'name', 'profileIconId', 'revisionDate', 'summonerLevel']
    return properties.every(p => p in response)
}

export const isErrorResponse = (response: any): response is ErrorResponse => {
    if (!('status' in response)) return false
    if ('message' in response.status && 'status_code' in response.status) return true
    return false
}

export const isMatchIdsResponse = (response: any): response is MatchIdsResponse => {
    return Array.isArray(response) && response.every(id => typeof id === 'string')
}

export const isMatchResponse = (response: any): response is MatchResponse => {
    if (!('metadata' in response) || !('info' in response)) return false
    if (!('matchId' in response.metadata) || !('participants' in response.metadata)) return false

    const properties = ['gameCreation', 'gameDuration', 'gameEndTimestamp', 'gameId', 'gameMode', 'gameStartTimestamp', 'gameType', 'gameVersion', 'mapId', 'participants']
    return properties.every(p => p in response.info)
}
