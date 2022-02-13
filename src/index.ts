import { config } from '@/config'
import { Intents } from 'discord.js'
import { Client } from 'discordx'
import 'dotenv/config'

export const client = new Client({
    botId: 'int-bot-v2',
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

client.on('ready', async () => {
    await client.initApplicationCommands()
    await client.initApplicationPermissions()
})

const run = async () => {
    client.login(config.BOT_TOKEN)
    // const riotClient = new RiotClient(config.RIOT_TOKEN)
}

await run()
