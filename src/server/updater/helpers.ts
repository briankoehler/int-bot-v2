import axios from 'axios'

export const convertQueueIdToNameAndMap = async (id: number): Promise<[string, string]> => {
    const data: any[] = (await axios.get('https://static.developer.riotgames.com/docs/lol/queues.json')).data

    for (const d of data) {
        if (d.queueId === id) return [d.description, d.map]
    }

    throw Error('Unable to parse queue ID.')
}

export const convertChampionIdToName = async (id: number): Promise<string> => {
    const data = (await axios.get('http://ddragon.leagueoflegends.com/cdn/12.4.1/data/en_US/champion.json')).data.data

    for (const champion in data) {
        if (Number(data[champion].key) === id) return data[champion].name
    }

    throw Error(`Unable to parse champion ID: ${id}`)
}