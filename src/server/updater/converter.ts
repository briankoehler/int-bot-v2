import axios from 'axios'

/**
 * Convert Riot API constants to their respective string values
 */
 export class Converter {
    private static championMap: { [id: number]: string } = {}
    private static queueMap: { [id: number]: [string, string] } = {}
    private static initialized = false

    /**
     * Construct the necessary maps to convert constants. This is done to avoid iterating
     * the data that Riot provides on every conversion.
     */
    public static init = async () => {
        // Get version
        const version: string = (await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')).data[0]

        // Construct an id-to-champion map for current version
        const championData: { [key: string]: { key: string, name: string } } = (await axios.get(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)).data.data
        for (const champion in championData) {
            Converter.championMap[Number(championData[champion].key)] = championData[champion].name
        }

        // Construct an id-to-queue-and-map map
        const queueData: any[] = (await axios.get('https://static.developer.riotgames.com/docs/lol/queues.json')).data
        for (const queue of queueData) {
            Converter.queueMap[queue.queueId] = [queue.description, queue.map]
        }

        Converter.initialized = true
    }

    /**
     * Convert a queue constant to it's name and map.
     * @param id Queue constant ID
     * @returns Both the name and map the match was in
     */
    static convertQueueIdToNameAndMap = async (id: number): Promise<[string, string]> => {
        Converter.checkInitialized()
        if (Converter.queueMap[id] !== undefined) return Converter.queueMap[id]
        throw Error(`Unable to parse queue ID: ${id}`)
    }

    /**
     * Convert a champion constant to it's string name.
     * @param id Champion constant ID
     * @returns Name of champion
     */
    static convertChampionIdToName = async (id: number): Promise<string> => {
        Converter.checkInitialized()
        if (Converter.championMap[id] !== undefined) return Converter.championMap[id]
        throw Error(`Unable to parse champion ID: ${id}`)
    }

    private static checkInitialized = () => {
        if (!Converter.initialized) throw Error('Converter not yet initialized.')
    }
}