import { performSafePrismaOperation } from '../../common/helpers'
import { RiotApi } from '../../common/riotApi'
import { config } from '../../config'
import { prisma } from '../../db/dbClient'

export abstract class Updater {
    protected static riot: RiotApi = new RiotApi(config.RIOT_TOKEN)
    public abstract update(): Promise<void> // For some reason this doesn't actually work

    /**
     * Get PUUIDs located in db.
     * @returns Array of PUUIDs
     */
    protected static getSummoners = async () => {
        const summonersOp = await performSafePrismaOperation(
            async () => await prisma.summoner.findMany()
        )

        if (!summonersOp.ok) return []
        return summonersOp.value
    }
}
