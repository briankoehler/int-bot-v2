import { BitFieldResolvable, Client, Collection, DMChannel, IntentsString } from 'discord.js'
import fs from 'fs'
import { Command, isCommand, isEvent } from '../common/types/bot'

type directoryPrefix = `/${string}`

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
    public setIntents = (intents: BitFieldResolvable<IntentsString, number>) => {
        this.intents = intents
        return this
    }

    /**
     * Poise a command handler directory.
     * @param dir Relative directory containing command files
     * @returns this
     */
    public buildCommands = (dir: directoryPrefix) => {
        this.commandDirs.push(dir)
        return this
    }

    /**
     * Poise an event handler directory.
     * @param dir Relative directory containing event files
     * @returns this
     */
    public buildEvents = (dir: directoryPrefix) => {
        this.eventDirs.push(dir)
        return this
    }

    /**
     * Build the designed Discord.js client.
     * @returns Discord.js client
     */
    public build = async () => {
        const client = new Client({ intents: this.intents })
        // @ts-ignore - Discord.js typing are wrong and do not contain commands on client
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
            try {
                const commandFiles = fs
                    .readdirSync(`${__dirname}${dir}`)
                    .filter(f => f.endsWith('.js'))

                commandFiles.forEach(async file => {
                    const { command } = await import(`.${dir}/${file}`)
                    if (!isCommand(command)) throw Error(`Command file not parsable: ${file}`)
                    // @ts-ignore - Discord.js typing are wrong and do not contain commands on client
                    client.commands.set(command.data.name, command)
                })
            } catch (e) {
                console.error(e)
            }
        })
    }

    /**
     * Build the event listeners for a Discord.js client.
     * @param client Discord.js client to set event listeners on
     */
    private realBuildEvents = async (client: Client) => {
        this.eventDirs.forEach(dir => {
            try {
                const eventFiles = fs
                    .readdirSync(`${__dirname}${dir}`)
                    .filter(f => f.endsWith('.js'))

                eventFiles.forEach(async file => {
                    const { event } = await import(`./events/${file}`)
                    if (!isEvent(event)) throw Error(`Event file not parsable: ${file}`)

                    if (event.once)
                        client.once(event.name, async (...args) => await event.execute(args))
                    else client.on(event.name, async (...args) => await event.execute(...args))
                })
            } catch (e) {
                console.error(e)
            }
        })
    }

    /**
     * Attach a command handler to a client.
     * @param client Discord.js to attach command handler to
     */
    private addCommandHandler = async (client: Client) => {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return

            // @ts-ignore - Discord.js typing are wrong and do not contain commands on client
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
