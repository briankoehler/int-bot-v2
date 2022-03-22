import {
    ChampionResponse,
    isChampionResponse,
    isQueueResponse,
    QueueResponse
} from '../../../src/common/types/dataDragon'

describe('isChampionResponse', () => {
    it('succeeds on valid ChampionResponse', () => {
        const validResponse: ChampionResponse = {
            type: 'champion',
            data: {}
        }
        expect(isChampionResponse(validResponse)).toBe(true)
    })

    it('fails on non-object', () => {
        const invalidResponse = 'foo'
        expect(isChampionResponse(invalidResponse)).toBe(false)
    })

    it('fails on invalid type', () => {
        const invalidResponse: unknown = {
            type: 'c H amPiOn',
            data: {}
        }
        expect(isChampionResponse(invalidResponse)).toBe(false)
    })

    it('fails on missing data', () => {
        const invalidResponse: unknown = {
            type: 'champion'
        }
        expect(isChampionResponse(invalidResponse)).toBe(false)
    })

    it('fails on missing type', () => {
        const invalidResponse: unknown = {
            data: {}
        }
        expect(isChampionResponse(invalidResponse)).toBe(false)
    })

    it('fails on missing type and data', () => {
        const invalidResponse: unknown = {}
        expect(isChampionResponse(invalidResponse)).toBe(false)
    })
})

describe('isQueueResponse', () => {
    it('succeeds on valid response', () => {
        const validResponse: QueueResponse = [
            {
                queueId: 420,
                map: "Summoner's Rift",
                description: "Summoner's Rift"
            }
        ]
        expect(isQueueResponse(validResponse)).toBe(true)
    })

    it('fails on non-array', () => {
        const invalidResponse = 'foo'
        expect(isQueueResponse(invalidResponse)).toBe(false)
    })

    it('fails on missing queueId', () => {
        const invalidResponse: unknown = [
            {
                map: "Summoner's Rift",
                description: "Summoner's Rift"
            }
        ]
        expect(isQueueResponse(invalidResponse)).toBe(false)
    })

    it('fails on missing map', () => {
        const invalidResponse: unknown = [
            {
                queueId: 420,
                description: "Summoner's Rift"
            }
        ]
        expect(isQueueResponse(invalidResponse)).toBe(false)
    })

    it('fails on missing description', () => {
        const invalidResponse: unknown = [
            {
                queueId: 420,
                map: "Summoner's Rift"
            }
        ]
        expect(isQueueResponse(invalidResponse)).toBe(false)
    })
})
