import prisma from '../../db/dbClient'
import { Updater } from './updater'

export abstract class SummonersUpdater extends Updater {
    /**
     * Main function to get updates
     */
    static update = async () => {
        const summoners = await SummonersUpdater.getSummoners()

        for (const summoner of summoners) {
            const riotData = await SummonersUpdater.riot.getSummoner(summoner.puuid)

            if (!riotData.ok) {
                console.error(riotData.value)
                continue
            }

            const name = riotData.value.name
            if (name !== summoner.name)
                prisma.instance.summoner.update({
                    where: { puuid: summoner.puuid },
                    data: { name }
                })
        }
    }
}
