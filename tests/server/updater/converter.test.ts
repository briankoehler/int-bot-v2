import axios from 'axios'
import { when } from 'jest-when'
import { Converter } from '../../../src/server/updater/converter'

jest.mock('axios')
const mockedAxios = jest.mocked(axios, true)

it('does not convert if not initialized', async () => {
    await expect(Converter.convertQueueIdToNameAndMap(0)).resolves.toStrictEqual({
        ok: false,
        value: Error('Converter not initialized')
    })
    await expect(Converter.convertChampionIdToName(0)).resolves.toStrictEqual({
        ok: false,
        value: Error('Converter not initialized')
    })
})

describe('data dragon errors', () => {
    it('returns an error when version data not obtained', async () => {
        when(mockedAxios.get)
            .calledWith('https://ddragon.leagueoflegends.com/api/versions.json')
            .mockResolvedValue({
                status: 404,
                statusText: 'Not Found'
            })

        await expect(Converter.init()).resolves.toStrictEqual({
            ok: false,
            value: Error('Could not get version data: Not Found')
        })
    })

    it('returns an error when champion data not obtained', async () => {
        when(mockedAxios.get)
            .calledWith('https://ddragon.leagueoflegends.com/api/versions.json')
            .mockResolvedValue({ status: 200, data: ['8.24.1'] })

        when(mockedAxios.get)
            .calledWith(when((url: string) => url.includes('champion.json')))
            .mockResolvedValue({ status: 404, statusText: 'Not Found' })

        await expect(Converter.init()).resolves.toStrictEqual({
            ok: false,
            value: Error('Could not get champion data: Not Found')
        })
    })
})
