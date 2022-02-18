-- CreateEnum
CREATE TYPE "Team" AS ENUM ('BLUE', 'RED');

-- CreateTable
CREATE TABLE "guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summoner" (
    "puuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "summoner_pkey" PRIMARY KEY ("puuid")
);

-- CreateTable
CREATE TABLE "GuildFollowing" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,

    CONSTRAINT "GuildFollowing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "match_id" TEXT NOT NULL,
    "start_time" BIGINT NOT NULL,
    "duration" BIGINT NOT NULL,
    "queue" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "winning_team" "Team" NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "champion" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "team" "Team" NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuildFollowing" ADD CONSTRAINT "GuildFollowing_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildFollowing" ADD CONSTRAINT "GuildFollowing_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;
