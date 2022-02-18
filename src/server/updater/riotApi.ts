import axios from 'axios'
import { config } from '../../config'
import { isErrorResponse, isMatchIdsResponse, isMatchResponse, isSummonerResponse } from './helpers'

export class RiotApi {
    private riotToken: string
    private defaultError = 'Not a recognized response.'

    constructor(riotToken: string) {
        this.riotToken = riotToken
        if (riotToken !== config.RIOT_TOKEN) console.warn('Riot Client\'s token does not match config. Are you sure that\'s right?')
    }

    /**
     * Query Riot API using the established token.
     * @param endpoint Riot API endpoint
     * @returns Riot API response
     */
    private getWithToken = async (endpoint: string) => {
        return await axios.get(endpoint, { headers: { 'X-RIOT-TOKEN': this.riotToken } })
    }

    /**
     * Queries Riot API for summoner PUUID.
     * @param summonerName Summoner name to query by
     * @returns PUUID of summoner
     */
    getPuuid = async (summonerName: string) => {
        const resp = await this.getWithToken(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`)
        const data = resp.data

        if (isSummonerResponse(data)) return data.puuid
        if (isErrorResponse(data)) throw Error(`Unable to get PUUID: ${data.status.message}`)
        if (resp.status !== 200) throw Error(`Could not get summoner data: ${resp.statusText}`)
        throw Error(`Unable to get PUUID: ${this.defaultError}`)
    }

    /**
     * Queries Riot API for summoner recent matches.
     * @param puuid PUUID of summoner to get recent matches for
     * @param origin An optional start time to get matches from
     * @returns Array of match IDs
     */
    getSummonerMatchIds = async (puuid: string, origin?: number) => {
        if (origin !== undefined) {
            const resp = await this.getWithToken(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?startTime=${origin}&start=0&count=100`)
            const data = resp.data

            if (isMatchIdsResponse(data)) return data
            if (isErrorResponse(data)) throw Error(`Unable to get match IDs: ${data.status.message}`)
            if (resp.status !== 200) throw Error(`Could not get match IDs: ${resp.statusText}`)
            throw Error(`Unable to get match IDs: ${this.defaultError}`)
        }

        const resp = await this.getWithToken(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`)
        const data = resp.data

        if (isMatchIdsResponse(data)) return data
        if (isErrorResponse(data)) throw Error(`Unable to get match IDs: ${data.status.message}`)
        if (resp.status !== 200) throw Error(`Could not get match IDs: ${resp.statusText}`)
        throw Error(`Unable to get match IDs: ${this.defaultError}`)
    }

    /**
     * Queries Riot API for match data.
     * @param id Match ID to query
     * @returns Data about match
     */
    getMatch = async (id: string) => {
        const resp = await this.getWithToken(`https://americas.api.riotgames.com/lol/match/v5/matches/${id}`)
        const data = resp.data

        if (isMatchResponse(data)) return data
        if (isErrorResponse(data)) throw Error(`Unable to get match: ${data.status.message}`)
        if (resp.status !== 200) throw Error(`Could not get match data: ${resp.statusText}`)
        throw Error(`Unable to get match: ${this.defaultError}`)
    }
}
