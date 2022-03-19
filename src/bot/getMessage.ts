import fs from 'fs'
import yaml from 'js-yaml'
import { isTemplatesDoc } from '../common/types/bot'
import { Result } from '../common/types/errors'

/**
 * Get a message from the messages.yaml file based on the number of deaths.
 * @param summoner Summoner name
 * @param kills Number of kills
 * @param deaths Number of deaths
 * @param assists Number of assists
 * @returns A formatted message
 */
export const getMessage = (
    summoner: string,
    kills: number,
    deaths: number,
    assists: number
): Result<string> => {
    const templateResult = getTemplate(deaths)

    if (!templateResult.ok) return { ok: false, value: templateResult.value }
    return {
        ok: true,
        value: formatMessage(templateResult.value, summoner, kills, deaths, assists)
    }
}

/**
 * Get a template for the number of deaths.
 * @param deaths Number of deaths
 * @returns A formatted message
 */
const getTemplate = (deaths: number): Result<string> => {
    try {
        const doc = yaml.load(fs.readFileSync('./src/bot/messages.yaml', 'utf8'))
        if (!isTemplatesDoc(doc)) return { ok: false, value: Error('Invalid messages.yaml file') }

        const key = Object.keys(doc.ints).reduce((prev, current) =>
            Math.abs(deaths - parseInt(current)) < Math.abs(deaths - parseInt(prev))
                ? current
                : prev
        )

        const randomNum = (doc.ints[key].length * Math.random()) | 0

        return { ok: true, value: doc.ints[key][randomNum] }
    } catch (e) {
        return { ok: false, value: Error(`An error occurred when getting templates: ${e}`) }
    }
}

/**
 * Format a message template.
 * @param message Message template
 * @param summoner Summoner name
 * @param kills Number of kills
 * @param deaths Number of deaths
 * @param assists Number of assists
 * @returns Formatted message
 */
const formatMessage = (
    message: string,
    summoner: string,
    kills: number,
    deaths: number,
    assists: number
) => {
    return message
        .replace('{k}', kills.toString())
        .replace('{d}', deaths.toString())
        .replace('{a}', assists.toString())
        .replace('{s}', summoner)
        .replace('{S}', summoner.toUpperCase())
}
