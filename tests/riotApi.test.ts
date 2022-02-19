import axios from 'axios'
import { config } from '../src/config'
import { RiotApi } from '../src/server/updater/riotApi'
import { RiotResponse } from '../src/server/updater/types'

jest.mock('axios')

const riotApi = new RiotApi(config.RIOT_TOKEN)

const errorResponse: RiotResponse.ErrorResponse = {
    status: {
        message: 'Test message',
        status_code: 400
    }
}

const garbageResponse = {
    message: 'wat???',
    exception: 'wat?????????',
}

describe('get puuid', () => {
    it('returns abcd1234', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: {
                id: 'asdfre2b_dsfasdf',
                accountId: 'asdfjklasasdfjasdlkf',
                puuid: 'abcd1234',
                name: 'Koehler Express',
                profileIconId: 747,
                revisionDate: 1644475010000,
                summonerLevel: 441
            },
            status: 200
        })

        await expect(riotApi.getPuuid('Koehler Express')).resolves.toEqual('abcd1234')
    })

    it('throws an error from error response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: errorResponse,
            status: 400
        })

        await expect(riotApi.getPuuid('Koehler Express')).rejects.toThrow()
    })

    it('throws an error from garbage response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: garbageResponse,
            status: 29830
        })

        await expect(riotApi.getPuuid('Koehler Express')).rejects.toThrow()
    })
})

describe('get match IDs', () => {
    it('returns 4 matches', async () => {
        const data = ['abc', 'def', 'ghi', 'jkl'];
        (axios.get as jest.Mock).mockResolvedValue({ data })

        await expect(riotApi.getSummonerMatchIds('asdfasd')).resolves.toEqual(data)
    })

    it('throws an error from error response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: errorResponse
        })

        await expect(riotApi.getSummonerMatchIds('asdfkasd')).rejects.toThrow()
    })

    it('throws an error from garbage response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: garbageResponse
        })

        await expect(riotApi.getSummonerMatchIds('adfawesrf')).rejects.toThrow()
    })
})

describe('get match data', () => {
    it('returns 4 matches', async () => {
        const data: RiotResponse.MatchResponse = {
            metadata: {
                'matchId': 'abc',
                participants: ['abc', 'def', 'ghi', 'jkl'],
            },
            info: {
                gameCreation: 123985,
                gameDuration: 69,
                gameEndTimestamp: 1238501235,
                gameId: 123123,
                gameMode: 'flex',
                gameStartTimestamp: 1231234,
                gameType: 'rift baby',
                gameVersion: '12.9.1',
                mapId: 0,
                participants: []
            }
        };
        (axios.get as jest.Mock).mockResolvedValue({ data })

        await expect(riotApi.getMatch('asdfasd')).resolves.toEqual(data)
    })

    it('throws an error from error response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: errorResponse
        })

        await expect(riotApi.getMatch('asdfkasd')).rejects.toThrow()
    })

    it('throws an error from garbage response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
            data: garbageResponse
        })

        await expect(riotApi.getMatch('adfawesrf')).rejects.toThrow()
    })
})
