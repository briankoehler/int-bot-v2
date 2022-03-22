import { SummonerStats } from '@prisma/client'
import * as helpers from '../../src/common/helpers'

describe('isObject', () => {
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
    it('succeeds on SummonerStats type', () => {
        const validStats: SummonerStats = {
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
        const validStats: SummonerStats = {
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
})
