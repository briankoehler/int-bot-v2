import * as prisma from '@prisma/client'
import * as errors from '../prismaErrors'

jest.mock('@prisma/client', () => ({
    __esmodule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(jest.requireActual('@prisma/client') as any),
    Prisma: {
        PrismaClientKnownRequestError: errors.PrismaClientKnownRequestError,
        PrismaClientUnknownRequestError: errors.PrismaClientUnknownRequestError,
        PrismaClientRustPanicError: errors.PrismaClientRustPanicError,
        PrismaClientInitializationError: errors.PrismaClientInitializationError,
        PrismaClientValidationError: errors.PrismaClientValidationError
    }
}))

let helpers: typeof import('../../src/common/helpers')

describe('isObject', () => {
    beforeAll(async () => {
        helpers = await import('../../src/common/helpers')
    })

    it('succeeds on empty object', () => expect(helpers.isObject({})).toBe(true))

    it('succeeds on object', () => expect(helpers.isObject({ a: 1 })).toBe(true))

    it('succeeds on date', () => expect(helpers.isObject(new Date())).toBe(true))

    it('succeeds on map', () => expect(helpers.isObject(new Map())).toBe(true))

    it('succeeds on set', () => expect(helpers.isObject(new Set())).toBe(true))

    it('succeeds on regex', () => expect(helpers.isObject(/a/)).toBe(true))

    it('fails on null', () => expect(helpers.isObject(null)).toBe(false))

    it('fails on undefined', () => expect(helpers.isObject(undefined)).toBe(false))

    it('fails on number', () => expect(helpers.isObject(1)).toBe(false))

    it('fails on string', () => expect(helpers.isObject('a')).toBe(false))

    it('fails on boolean', () => expect(helpers.isObject(true)).toBe(false))

    it('fails on array', () => expect(helpers.isObject([])).toBe(false))

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('fails on function', () => expect(helpers.isObject(() => {})).toBe(false))
})

describe('isSummonerStats', () => {
    beforeAll(async () => {
        helpers = await import('../../src/common/helpers')
    })

    it('succeeds on SummonerStats type', () => {
        const validStats: prisma.SummonerStats = {
            id: '',
            puuid: '',
            matchId: '',
            kills: 0,
            deaths: 0,
            assists: 0,
            champion: '',
            position: '',
            team: 'BLUE',
            totalTimeDead: 0,
            challenges: ''
        }
        expect(helpers.isSummonerStats(validStats)).toBe(true)
    })

    it('succeeds on type that prisma returns', () => {
        const validStats = {
            id: '',
            puuid: '',
            match_id: '',
            kills: 0,
            deaths: 0,
            assists: 0,
            champion: '',
            position: '',
            team: 'BLUE',
            total_time_dead: 0,
            challenges: ''
        }
        expect(helpers.isSummonerStats(validStats)).toBe(true)
    })

    it('fails when a property is missing', () => {
        const validStats: prisma.SummonerStats = {
            id: '',
            puuid: '',
            matchId: '',
            kills: 0,
            deaths: 0,
            assists: 0,
            champion: '',
            position: '',
            team: 'BLUE',
            totalTimeDead: 0,
            challenges: ''
        }
        expect(helpers.isSummonerStats(validStats)).toBe(true)
        Object.entries(validStats).forEach(([key]) => {
            const stats = { ...validStats }
            delete (stats as never)[key]
            expect(helpers.isSummonerStats(stats)).toBe(false)
        })
    })

    it('fails on null', () => expect(helpers.isSummonerStats(null)).toBe(false))

    it('fails on undefined', () => expect(helpers.isSummonerStats(undefined)).toBe(false))
})

describe('performSafePrismaOperation', () => {
    beforeAll(async () => {
        helpers = await import('../../src/common/helpers')
    })

    it('succeeds on a valid callback', async () => {
        const result = await helpers.performSafePrismaOperation(() => Promise.resolve('foo'))
        expect(result).toStrictEqual({
            ok: true,
            value: 'foo'
        })
    })

    it('fails from PrismaClientKnownRequestError', async () => {
        const error = new errors.PrismaClientKnownRequestError(
            'test message',
            'test code',
            'test details'
        )
        const result = await helpers.performSafePrismaOperation(async () => {
            throw error
        })
        expect(result.ok).toBe(false)
        expect(result.value).toBeInstanceOf(Error)
    })

    it('fails from PrismaClientUnknownRequestError', async () => {
        const error = new errors.PrismaClientUnknownRequestError('test message', 'test code')
        const result = await helpers.performSafePrismaOperation(async () => {
            throw error
        })
        expect(result.ok).toBe(false)
        expect(result.value).toBeInstanceOf(Error)
    })

    it('fails from PrismaClientRustPanicError', async () => {
        const error = new errors.PrismaClientRustPanicError('test message', 'test code')
        const result = await helpers.performSafePrismaOperation(async () => {
            throw error
        })
        expect(result.ok).toBe(false)
        expect(result.value).toBeInstanceOf(Error)
    })

    it('fails from PrismaClientInitializationError', async () => {
        const error = new errors.PrismaClientInitializationError(
            'test message',
            'test code',
            'test details'
        )
        const result = await helpers.performSafePrismaOperation(async () => {
            throw error
        })
        expect(result.ok).toBe(false)
        expect(result.value).toBeInstanceOf(Error)
    })

    it('fails from PrismaClientValidationError', async () => {
        const error = new errors.PrismaClientValidationError('test message')
        const result = await helpers.performSafePrismaOperation(async () => {
            throw error
        })
        expect(result.ok).toBe(false)
        expect(result.value).toBeInstanceOf(Error)
    })

    it('fails from unknown type error', async () => {
        const result = await helpers.performSafePrismaOperation(async () => {
            throw 'oh no!'
        })
        expect(result.ok).toBe(false)
        expect(result.value).toBeInstanceOf(Error)
    })
})
