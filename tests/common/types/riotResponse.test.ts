import {
    ErrorResponse,
    isErrorResponse,
    isSummonerResponse,
    SummonerResponse
} from '../../../src/common/types/riotResponse'

describe('isSummonerResponse', () => {
    it('succeeds on a valid response', () => {
        const response: SummonerResponse = {
            id: '',
            accountId: '',
            puuid: '',
            name: '',
            profileIconId: 0,
            revisionDate: 0,
            summonerLevel: 0
        }

        expect(isSummonerResponse(response)).toBe(true)
    })

    it('fails when not an object', () => {
        const nonObjects = [undefined, null, '', 0, true, false, []]
        nonObjects.forEach(r => expect(isSummonerResponse(r)).toBe(false))
    })

    it('fails when a property is null or undefined', () => {
        const response: SummonerResponse = {
            id: '',
            accountId: '',
            puuid: '',
            name: '',
            profileIconId: 0,
            revisionDate: 0,
            summonerLevel: 0
        }

        Object.entries(response).forEach(([key]) => {
            const copy = { ...response }
            Object.assign(copy, { [key]: null })
            expect(isSummonerResponse(copy)).toBe(false)

            delete (copy as never)[key]
            expect(isSummonerResponse(copy)).toBe(false)
        })
    })
})

describe('isErrorResponse', () => {
    it('succeeds on valid response', () => {
        const response: ErrorResponse = { status: { message: '', status_code: 0 } }
        expect(isErrorResponse(response)).toBe(true)
    })

    it('fails on non-object', () => {
        const nonObjects = [undefined, null, '', 0, true, false, []]
        nonObjects.forEach(r => expect(isErrorResponse(r)).toBe(false))
    })

    it('fails when status is not an object', () => {
        const response: unknown = { status: 'not an object' }
        expect(isErrorResponse(response)).toBe(false)
    })

    it('fails when there is no status', () => {
        const response: unknown = {}
        expect(isErrorResponse(response)).toBe(false)
    })

    it('fails when status is missing message and/or status_code', () => {
        const response: unknown = {
            status: {}
        }
        expect(isErrorResponse(response)).toBe(false)
    })
})
