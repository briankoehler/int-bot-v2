import {
    ErrorResponse,
    isErrorResponse,
    isMatchIdsResponse,
    isMatchResponse,
    isSummonerResponse,
    MatchResponse,
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

describe('isMatchIdsResponse', () => {
    it('succeeds on array of strings', () => {
        const response: string[] = ['', '']
        expect(isMatchIdsResponse(response)).toBe(true)
    })

    it('fails on non-array', () => {
        const nonArrays = [undefined, null, '', 0, true, false, {}]
        nonArrays.forEach(r => expect(isMatchIdsResponse(r)).toBe(false))
    })

    it('fails when array is not of strings', () => {
        const response: unknown = ['', 0]
        expect(isMatchIdsResponse(response)).toBe(false)
    })
})

describe('isMatchResponse', () => {
    it('succeeds on a valid match response', () => {
        const response: MatchResponse = {
            metadata: {
                matchId: '',
                participants: []
            },
            info: {
                gameCreation: 0,
                gameDuration: 0,
                gameEndTimestamp: 0,
                gameId: 0,
                gameMode: '',
                gameStartTimestamp: 0,
                gameType: '',
                gameVersion: '',
                mapId: 0,
                queueId: 0,
                participants: []
            }
        }

        expect(isMatchResponse(response)).toBe(true)
    })

    it('fails when not an object', () => {
        const nonObjects = [undefined, null, '', 0, true, false, []]
        nonObjects.forEach(r => expect(isMatchResponse(r)).toBe(false))
    })

    it('fails when a property is null or undefined', () => {
        const response: MatchResponse = {
            metadata: {
                matchId: '',
                participants: []
            },
            info: {
                gameCreation: 0,
                gameDuration: 0,
                gameEndTimestamp: 0,
                gameId: 0,
                gameMode: '',
                gameStartTimestamp: 0,
                gameType: '',
                gameVersion: '',
                mapId: 0,
                queueId: 0,
                participants: []
            }
        }

        Object.entries(response).forEach(([key]) => {
            const copy = { ...response }
            Object.assign(copy, { [key]: null })
            expect(isMatchResponse(copy)).toBe(false)

            delete (copy as never)[key]
            expect(isMatchResponse(copy)).toBe(false)
        })
    })

    it('fails when metadata missing info', () => {
        const response: unknown = { metadata: {}, info: {} }
        expect(isMatchResponse(response)).toBe(false)
    })
})
