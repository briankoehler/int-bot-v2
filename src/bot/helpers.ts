import { isObject } from '../common/helpers'
import { Command, Event } from './types'

export const isCommand = (x: unknown): x is Command => {
    if (!isObject(x)) return false
    return 'data' in x && 'execute' in x && 'guildOnly' in x
}

export const isEvent = (x: unknown): x is Event => {
    if (!isObject(x)) return false
    return 'name' in x && 'once' in x && 'execute' in x
}
