import { isObject } from '../helpers'

export interface ChampionResponse {
    type: 'champion'
    data: {
        [key: string]: {
            key: string
            name: string
        }
    }
}

interface Queue {
    queueId: number
    map: string
    description: string | null
}

export type QueueResponse = Queue[]

export type VersionResponse = string[]

/* Type Guards */

export const isChampionResponse = (response: unknown): response is ChampionResponse => {
    if (!isObject(response)) return false
    if (response.type !== 'champion') return false
    if (response.data === undefined) return false
    return true
}

export const isQueueResponse = (response: unknown): response is QueueResponse => {
    const properties = ['queueId', 'map', 'description']
    if (!Array.isArray(response)) return false
    return properties.every(p => p in response[0])
}
