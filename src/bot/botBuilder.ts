import { BitFieldResolvable, Client, Collection, DMChannel, IntentsString } from 'discord.js'
import fs from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { isCommand, isEvent } from './helpers'
import { Command } from './types'

/**
 * Build a Discord.js using helper methods.
 */
export class BotBuilder {
    private intents: BitFieldResolvable<IntentsString, number> = []
    private commandDirs: string[] = []
    private eventDirs: string[] = []

    /**
     * Set the intents in accordance with Discord standards.
     * @param intents Desired intents for client
     * @returns this
     */
    setIntents = (intents: BitFieldResolvable<IntentsString, number>) => {
        this.intents = intents
        return this
    }

    /**
     * Poise a command handler directory.
     * @param dir Relative directory containing command files
     * @returns this
     */
    buildCommands = (dir: string) => {
        this.commandDirs.push(dir)
        return this
    }

    /**
     * Poise an event handler directory.
     * @param dir Relative directory containing event files
     * @returns this
     */
    buildEvents = (dir: string) => {
        this.eventDirs.push(dir)
        return this
    }

    /**
     * Build the designed Discord.js client.
     * @returns Discord.js client
     */
    build = async () => {
        const client = new Client({ intents: this.intents })
        // @ts-ignore
        client.commands = new Collection<string, Command>()

        await this.realBuildCommands(client)
        await this.realBuildEvents(client)
        await this.addCommandHandler(client)

        return client
    }

    /**
     * Build the commands set for a Discord.js client.
     * @param client Discord.js client to set commands on
     */
    private realBuildCommands = async (client: Client) => {
        this.commandDirs.forEach(async dir => {
            const commandFiles = fs
                .readdirSync(`${dirname(fileURLToPath(import.meta.url))}${dir}`)
                .filter(f => f.endsWith('.js'))

            commandFiles.forEach(async file => {
                const { command } = await import(`.${dir}/${file}`)
                if (!isCommand(command)) throw Error(`Command file not parsable: ${file}`)
                // @ts-ignore
                client.commands.set(command.data.name, command)
            })
        })
    }

    /**
     * Build the event listeners for a Discord.js client.
     * @param client Discord.js client to set event listeners on
     */
    private realBuildEvents = async (client: Client) => {
        this.eventDirs.forEach(dir => {
            const eventFiles = fs
                .readdirSync(`${dirname(fileURLToPath(import.meta.url))}${dir}`)
                .filter(f => f.endsWith('.js'))

            eventFiles.forEach(async file => {
                const { event } = await import(`./events/${file}`)
                if (!isEvent(event)) throw Error(`Event file not parsable: ${file}`)

                if (event.once)
                    client.once(event.name, async (...args) => await event.execute(args))
                else client.on(event.name, async (...args) => await event.execute(...args))
            })
        })
    }

    /**
     * Attach a command handler to a client.
     * @param client Discord.js to attach command handler to
     */
    private addCommandHandler = async (client: Client) => {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return

            // @ts-ignore
            const command: Command = client.commands.get(interaction.commandName)
            if (!command) return

            try {
                if (command.guildOnly && interaction.channel instanceof DMChannel) {
                    await interaction.reply('Command must be used in a guild.')
                    return
                }
                await command.execute(interaction)
            } catch (e) {
                console.error('An error occurred: ', e)
            }
        })
    }
}
