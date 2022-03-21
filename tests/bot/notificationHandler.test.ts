import { Guild, Summoner } from '@prisma/client'
import * as discord from 'discord.js'
import * as getMessage from '../../src/bot/getMessage'
import { NotificationHandler } from '../../src/bot/notificationHandler'
import { prismaMock } from '../testUtil'

jest.mock('../../src/bot/getMessage', () => ({
    __esmodule: true,
    getMessage: jest.fn()
}))

const mockedGetMessage = getMessage as jest.Mocked<typeof getMessage>

describe('payload handling', () => {
    const globalPool: { handler: NotificationHandler } = {
        handler: new NotificationHandler(new discord.Client({ intents: [] }))
    }
    const validPayload = {
        id: '',
        puuid: '',
        match_id: '',
        kills: 0,
        deaths: 10,
        assists: 0,
        champion: '',
        position: '',
        team: 'BLUE',
        total_time_dead: 0,
        challenges: ''
    }

    beforeAll(() => {
        const client = new discord.Client({ intents: [] })
        globalPool.handler = new NotificationHandler(client)
    })

    it('fails to parse payload', () => {
        const payloads = ['', '{', '}', '{}', '{ "id": "" }']

        payloads.forEach(async payload => {
            const result = await globalPool.handler.handle(payload)

            expect(result).toMatchObject({ ok: false })
            expect(result.value).not.toBeNull()
            expect(result.value?.message).toContain('Unable to parse notification payload:')
        })

        // expect(mockedHelpers.isSummonerStats).toHaveBeenCalledTimes(2)
    })

    it('does not care about ARAMS', async () => {
        // @ts-ignore - Prisma mocking doesn't work
        prismaMock.match.findFirst.mockResolvedValue({ queue: '5v5 ARAM games' })

        const payload = JSON.stringify(validPayload)
        const result = await globalPool.handler.handle(payload)

        expect(result).toStrictEqual({ ok: true, value: null })
    })

    it('cannot find the summoner', async () => {
        // @ts-ignore - Prisma mocking doesn't work
        prismaMock.match.findFirst.mockResolvedValue({ queue: '5v5 Draft Pick games' })
        // @ts-ignore - Prisma mocking doesn't work
        prismaMock.summoner.findFirst.mockResolvedValue(null)

        const payload = JSON.stringify(validPayload)
        const result = await globalPool.handler.handle(payload)

        expect(result).toMatchObject({ ok: false })
        expect(result.value).not.toBeNull()
        expect(result.value?.message).toContain('Unable to identify summoner:')
    })

    it('attempts to send messages when everything works', async () => {
        // Suppress console errors, because we're expecting them due to the fact that
        // we cannot mock sending Discord messages
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {})

        const following: Guild[] = [
            { id: 'abc', name: 'Test Guild 1', channelId: '123', active: true },
            { id: 'def', name: 'Test Guild 2', channelId: '456', active: true }
        ]
        const summoner: Summoner = {
            puuid: 'abc',
            name: 'test'
        }

        // @ts-ignore - Prisma mocking doesn't work
        prismaMock.match.findFirst.mockResolvedValue({ queue: '5v5 Draft Pick games' })
        // @ts-ignore - Prisma mocking doesn't work
        prismaMock.summoner.findFirst.mockResolvedValue(summoner)
        // @ts-ignore - Prisma mocking doesn't work
        prismaMock.guildFollowing.findMany.mockResolvedValue(following)
        mockedGetMessage.getMessage.mockReturnValue({ ok: false, value: Error('Message error') })

        const payload = JSON.stringify(validPayload)
        await expect(globalPool.handler.handle(payload)).resolves.toStrictEqual({
            ok: true,
            value: null
        })

        expect(mockedGetMessage.getMessage).toHaveBeenCalledTimes(2)
    })
})

describe('int scorelines', () => {
    const globalPool: { isInt: (...args: number[]) => boolean } = { isInt: () => true }

    beforeAll(() => {
        const client = new discord.Client({ intents: [] })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globalPool.isInt = (new NotificationHandler(client) as any).isInt
    })

    it('is an obvious int', () => {
        const kdas = [
            [0, 6, 0],
            [2, 12, 5],
            [1, 9, 4],
            [6, 21, 5],
            [1, 9999, 4]
        ]

        expect(kdas.every(kda => globalPool.isInt(...kda))).toBe(true)
    })

    it('is an obvious non-int', () => {
        const kdas = [
            [10, 0, 5],
            [9999, 1, 4],
            [21, 6, 2],
            [5, 5, 5],
            [1, 1, 1]
        ]

        expect(kdas.every(kda => globalPool.isInt(...kda))).toBe(false)
    })

    it('is a negative scoreline', () => {
        const kdas = [
            [-1, -1, -1],
            [-999, -999, -999]
        ]

        expect(kdas.every(kda => globalPool.isInt(...kda))).toBe(false)
    })

    it('is a close positive case', () => {
        const kdas = [
            [2, 7, 3],
            [1, 5, 2],
            [10, 15, 2],
            [15, 24, 3],
            [0, 4, 0]
        ]

        expect(kdas.every(kda => globalPool.isInt(...kda))).toBe(true)
    })

    it('is a close negative case', () => {
        const kdas = [
            [2, 4, 1],
            [10, 12, 4],
            [15, 17, 3],
            [0, 3, 0],
            [9999, 9999, 9999]
        ]

        expect(kdas.every(kda => globalPool.isInt(...kda))).toBe(false)
    })
})
