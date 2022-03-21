import { Client } from 'discord.js'
import { BotBuilder } from '../../src/bot/botBuilder'

it('successfully builds bot', async () => {
    const builder = new BotBuilder()

    const test = builder.setIntents(['GUILD_INTEGRATIONS', 'GUILD_MESSAGES'])
    expect(test).toMatchObject({ intents: ['GUILD_INTEGRATIONS', 'GUILD_MESSAGES'] })

    const test2 = builder.buildCommands('/commands').buildCommands('/commands2')
    expect(test2).toMatchObject({
        intents: ['GUILD_INTEGRATIONS', 'GUILD_MESSAGES'],
        commandDirs: ['/commands', '/commands2']
    })

    const test3 = builder.buildEvents('/events').buildEvents('/events2')
    expect(test3).toMatchObject({
        intents: ['GUILD_INTEGRATIONS', 'GUILD_MESSAGES'],
        commandDirs: ['/commands', '/commands2'],
        eventDirs: ['/events', '/events2']
    })

    // This assumes that the commands and events files exist.
    // Perhaps good to include in this test anyway to make sure its there.
    await expect(
        new BotBuilder()
            .setIntents(['DIRECT_MESSAGES'])
            .buildCommands('/commands')
            .buildEvents('/events')
            .build()
    ).resolves.toBeInstanceOf(Client)
})
