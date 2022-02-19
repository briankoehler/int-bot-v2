
export const config = {
    DEV: true,
    BOT_TOKEN: process.env.BOT_TOKEN || 'MISSING_BOT_TOKEN',
    CLIENT_ID: process.env.CLIENT_ID || 'MISSING_CLIENT_ID',
    RIOT_TOKEN: process.env.RIOT_TOKEN || 'MISSING_RIOT_TOKEN',
    DATABASE_URL: process.env.DATABASE_URL || 'MISSING_DATABASE_URL'
}
