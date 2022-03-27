import axios from 'axios'
import { resetAllWhenMocks, when } from 'jest-when'
import * as dataDragon from '../../../src/common/types/dataDragon'
import { Converter } from '../../../src/server/updater/converter'

jest.mock('axios')
const mockedAxios = jest.mocked(axios, true)

jest.mock('../../../src/common/types/dataDragon', () => ({
    __esmodule: true,
    isChampionResponse: jest.fn(),
    isQueueResponse: jest.fn()
}))
const mockedDataDragon = jest.mocked(dataDragon, true)

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
    beforeEach(() => resetAllWhenMocks())

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

describe('parsing problems', () => {
    beforeEach(() => {
        resetAllWhenMocks()
        when(mockedAxios.get)
            .calledWith('https://ddragon.leagueoflegends.com/api/versions.json')
            .mockResolvedValue({ status: 200, data: ['8.24.1'] })

        when(mockedAxios.get)
            .calledWith(when((url: string) => url.includes('champion.json')))
            .mockResolvedValue({
                status: 200,
                data: { data: { Aatrox: { key: '266', name: 'Aatrox' } } }
            })

        when(mockedAxios.get)
            .calledWith(when((url: string) => url.includes('queues.json')))
            .mockResolvedValue({
                status: 200,
                data: [
                    { queueId: 420, map: 'SR', description: "Summoner's Rift" },
                    { queueId: 440, map: 'SR', description: 'The Crystal Scar' }
                ]
            })
    })

    it('receives non-champion data', async () => {
        mockedDataDragon.isChampionResponse.mockReturnValue(false)
        await expect(Converter.init()).resolves.toStrictEqual({
            ok: false,
            value: Error(
                `Invalid champion response: ${JSON.stringify({
                    data: { Aatrox: { key: '266', name: 'Aatrox' } }
                })}`
            )
        })
    })

    it('receives non-queue data', async () => {
        mockedDataDragon.isChampionResponse.mockReturnValue(true)
        mockedDataDragon.isQueueResponse.mockReturnValue(false)
        await expect(Converter.init()).resolves.toStrictEqual({
            ok: false,
            value: Error(
                `Invalid queue response: ${JSON.stringify([
                    { queueId: 420, map: 'SR', description: "Summoner's Rift" },
                    { queueId: 440, map: 'SR', description: 'The Crystal Scar' }
                ])}`
            )
        })
    })
})

it('successfully initializes', async () => {
    resetAllWhenMocks()
    when(mockedAxios.get)
        .calledWith('https://ddragon.leagueoflegends.com/api/versions.json')
        .mockResolvedValue({ status: 200, data: ['8.24.1'] })

    when(mockedAxios.get)
        .calledWith(when((url: string) => url.includes('champion.json')))
        .mockResolvedValue({
            status: 200,
            data: { data: { Aatrox: { key: '266', name: 'Aatrox' } } }
        })

    when(mockedAxios.get)
        .calledWith(when((url: string) => url.includes('queues.json')))
        .mockResolvedValue({
            status: 200,
            data: [
                { queueId: 420, map: 'SR', description: "Summoner's Rift" },
                { queueId: 440, map: 'SR', description: 'The Crystal Scar' }
            ]
        })
    mockedDataDragon.isChampionResponse.mockReturnValue(true)
    mockedDataDragon.isQueueResponse.mockReturnValue(true)
    await expect(Converter.init()).resolves.toStrictEqual({ ok: true, value: null })
})

describe('attempts to convert', () => {
    beforeEach(() => {
        resetAllWhenMocks()
        when(mockedAxios.get)
            .calledWith('https://ddragon.leagueoflegends.com/api/versions.json')
            .mockResolvedValue({ status: 200, data: ['8.24.1'] })

        when(mockedAxios.get)
            .calledWith(when((url: string) => url.includes('champion.json')))
            .mockResolvedValue({
                status: 200,
                data: { data: { Aatrox: { key: '266', name: 'Aatrox' } } }
            })

        when(mockedAxios.get)
            .calledWith(when((url: string) => url.includes('queues.json')))
            .mockResolvedValue({
                status: 200,
                data: [
                    { queueId: 420, map: 'SR', description: "Summoner's Rift" },
                    { queueId: 440, map: 'SR', description: 'The Crystal Scar' }
                ]
            })

        Converter.init()
    })

    it('converts queue id to map and name', async () => {
        await expect(Converter.convertQueueIdToNameAndMap(420)).resolves.toStrictEqual({
            ok: true,
            value: ["Summoner's Rift", 'SR']
        })
    })

    it('fails to convert un-set queue id', async () => {
        await expect(Converter.convertQueueIdToNameAndMap(-1)).resolves.toStrictEqual({
            ok: false,
            value: Error('Unable to parse queue ID: -1')
        })
    })

    it('converts champ id to name', async () => {
        await expect(Converter.convertChampionIdToName(266)).resolves.toStrictEqual({
            ok: true,
            value: 'Aatrox'
        })
    })

    it('fails to convert un-set champion id', async () => {
        await expect(Converter.convertChampionIdToName(-1)).resolves.toStrictEqual({
            ok: false,
            value: Error('Unable to parse champion ID: -1')
        })
    })
})
