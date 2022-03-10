# Int Bot

Int Bot is a Discord bot dedicated to keeping track of who's running it down in League of Legends matches.

## Setup

1. Clone this repository by running `git clone github.com/briankoehler/int-bot-v2.git`

2. Create a `.env` file in the project's root directory. Set up your env variables within the file as below.
```env
BOT_TOKEN= # Discord bot's token
CLIENT_ID= # Discord bot's client ID
RIOT_TOKEN= # Riot API token
DATABASE_URL= # Connection string to primary database
SHADOW_DATABASE_URL= # Connection string to shadow database (required by Prisma)
```

3. Run `npm install` to fetch all required NPM packages.

4. Run `npm run commandRegister` to register the defined Discord bot commands.

5. Run `npx prisma generate` to create and apply database migrations.

5. Execute the SQL query located in `src/db/function.sql` on your database.

6. Execute the SQL query located in `src/db/trigger.sql` on your database.

7. Run `npm run server` and `npm run bot` as their own processes or in their own terminals.
