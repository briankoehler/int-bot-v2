import { Intents } from 'discord.js'
import { Client } from 'discordx'
import 'dotenv/config'
import { config } from '../config'

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
}

await run()
