import axios from 'axios'
import { config } from '../config'
import {
    isErrorResponse,
    isMatchIdsResponse,
    isMatchResponse,
    isSummonerResponse
} from './types/riotResponse'

export class RiotApi {
    private riotToken: string
    private defaultError = 'Not a recognized response.'

    constructor(riotToken: string) {
        this.riotToken = riotToken
        if (riotToken !== config.RIOT_TOKEN)
            console.warn("Riot Client's token does not match config. Are you sure that's right?")
    }

    /**
     * Query Riot API using the established token. Prevent rate limiting errors by waiting
     * specified amount of time.
     * @param endpoint Riot API endpoint
     * @returns Riot API response
     */
    private getWithToken = async (endpoint: string) => {
        const resp = await axios.get(endpoint, {
            headers: { 'X-RIOT-TOKEN': this.riotToken }
        })
        if (resp.status === 429) {
            const time = Number(resp.headers['Retry-After'])
            setTimeout(() => {
                return this.getWithToken(endpoint)
            }, time * 1000)
        }
        return resp
    }

    /**
     * Query Riot API and handle errors.
     * @param endpoint Riot API endpoint
     * @param isResponse Type guard to check if response is of expected type
     * @returns Result with either value or error
     */
    private getData = async (endpoint: string, isResponse: (arg0: unknown) => unknown) => {
        // Query Riot API
        const resp = await this.getWithToken(endpoint)
        const data = resp.data

        // Handle errors
        if (resp.status !== 200) {
            if (isErrorResponse(data)) return { ok: false, value: Error(resp.statusText) }
            return { ok: false, value: Error(resp.statusText) }
        }

        // Handle success
        if (isResponse(data)) return { ok: true, value: data }

        // Handle unexpected response
        return { ok: false, value: Error(this.defaultError) }
    }

    /**
     * Queries Riot API for summoner PUUID.
     * @param summonerName Summoner name to query by
     * @returns PUUID of summoner
     */
    getSummoner = async (summonerName: string) =>
        this.getData(
            `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`,
            isSummonerResponse
        )

    /**
     * Queries Riot API for summoner recent matches.
     * @param puuid PUUID of summoner to get recent matches for
     * @param origin An optional start time to get matches from
     * @returns Array of match IDs
     */
    getSummonerMatchIds = async (puuid: string, origin?: number) =>
        this.getData(
            `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5${
                origin ? `&startTime=${origin}` : ''
            }`,
            isMatchIdsResponse
        )

    /**
     * Queries Riot API for match data.
     * @param id Match ID to query
     * @returns Data about match
     */
    getMatch = async (id: string) =>
        this.getData(
            `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`,
            isMatchResponse
        )
}
