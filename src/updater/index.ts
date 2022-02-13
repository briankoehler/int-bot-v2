import { config } from '@/config'
import { RiotClient } from '@/updater/riotClient'

const getUpdates = async () => {
    const client = new RiotClient(config.RIOT_TOKEN)
}

await getUpdates()