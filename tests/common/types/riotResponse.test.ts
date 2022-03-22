import { isSummonerResponse, SummonerResponse } from '../../../src/common/types/riotResponse'

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
