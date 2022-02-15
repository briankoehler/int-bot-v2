import axios from 'axios'
import { config } from '../../config'

export class RiotApi {
    private riotToken: string

    constructor(riotToken: string) {
        this.riotToken = riotToken
        if (riotToken !== config.RIOT_TOKEN) console.warn('Riot Client\'s token does not match config. Are you sure that\'s right?')
    }

    private getWithToken = async (endpoint: string) => {
        return await axios.get(endpoint, { headers: { 'X-RIOT-TOKEN': this.riotToken } })
    }

    getPuid = async (summonerName: string) => {
        const resp = await this.getWithToken(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`)
        return resp.data.puuid
    }

    getSummonerMatchIds = async (puid: string, origin?: number) => {
        if (origin !== undefined) {
            const resp = await this.getWithToken(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puid}/ids?startTime=${origin}&start=0&count=100`)
            return resp.data
        }
        const resp = await this.getWithToken(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puid}/ids?start=0&count=100`)
        return resp.data
    }

    getMatch = async (id: string) => {
        const resp = await this.getWithToken(`https://americas.api.riotgames.com/lol/match/v5/matches/${id}`)
        return resp.data
    }
}