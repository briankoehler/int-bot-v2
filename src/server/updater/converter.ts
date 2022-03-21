import axios from 'axios'
import { isChampionResponse, isQueueResponse } from '../../common/types/dataDragon'
import { Result } from '../../common/types/errors'

/**
 * Convert Riot API constants to their respective string values
 */
export abstract class Converter {
    private static championMap: { [id: number]: string } = {}
    private static queueMap: { [id: number]: [string, string] } = {}
    private static initialized = false

    /**
     * Construct the necessary maps to convert constants. This is done to avoid iterating
     * the data that Riot provides on every conversion.
     */
    public static init = async (): Promise<Result<null>> => {
        const version: string = (
            await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
        ).data[0]

        // Construct an id-to-champion map for current version
        const champResp = await axios.get(
            `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        )
        if (champResp.status !== 200)
            return {
                ok: false,
                value: Error(`Could not get champion data: ${champResp.statusText}`)
            }

        const champData = champResp.data
        if (!isChampionResponse(champData))
            return {
                ok: false,
                value: Error(`Invalid champion response: ${JSON.stringify(champData)}`)
            }

        const realChampData = champData.data
        for (const champion in realChampData) {
            Converter.championMap[Number(realChampData[champion].key)] =
                realChampData[champion].name
        }

        // Construct an id-to-queue-and-map map
        const queueResp = await axios.get(
            'https://static.developer.riotgames.com/docs/lol/queues.json'
        )
        if (queueResp.status !== 200)
            return {
                ok: false,
                value: Error(`Could not fetch queue data: ${queueResp.statusText}`)
            }

        const queueData = queueResp.data
        if (!isQueueResponse(queueData))
            return {
                ok: false,
                value: Error(`Invalid queue response: ${JSON.stringify(queueData)}`)
            }

        for (const queue of queueData) {
            Converter.queueMap[queue.queueId] = [queue.description || '', queue.map]
        }

        Converter.initialized = true
        return { ok: true, value: null }
    }

    /**
     * Convert a queue constant to it's name and map.
     * @param id Queue constant ID
     * @returns Both the name and map the match was in
     */
    public static convertQueueIdToNameAndMap = async (
        id: number
    ): Promise<Result<[string, string]>> => {
        if (!Converter.initialized) return { ok: false, value: Error('Converter not initialized') }

        if (Converter.queueMap[id] !== undefined) return { ok: true, value: Converter.queueMap[id] }
        return { ok: false, value: Error(`Unable to parse queue ID: ${id}`) }
    }

    /**
     * Convert a champion constant to it's string name.
     * @param id Champion constant ID
     * @returns Name of champion
     */
    public static convertChampionIdToName = async (id: number): Promise<Result<string>> => {
        if (!Converter.initialized) return { ok: false, value: Error('Converter not initialized') }

        if (Converter.championMap[id] !== undefined)
            return { ok: true, value: Converter.championMap[id] }
        return { ok: false, value: Error(`Unable to parse champion ID: ${id}`) }
    }
}
