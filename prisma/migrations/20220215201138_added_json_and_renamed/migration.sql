/*
  Warnings:

  - You are about to drop the `player_stats` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `start_time` on the `match` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_match_id_fkey";

-- DropForeignKey
ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_puuid_fkey";

-- AlterTable
ALTER TABLE "match" DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMP NOT NULL;

-- DropTable
DROP TABLE "player_stats";

-- CreateTable
CREATE TABLE "summoner_stats" (
    "id" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "champion" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "team" "Team" NOT NULL,
    "total_time_dead" INTEGER NOT NULL,
    "challenges" JSONB NOT NULL,

    CONSTRAINT "summoner_stats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "summoner_stats" ADD CONSTRAINT "summoner_stats_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "summoner"("puuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summoner_stats" ADD CONSTRAINT "summoner_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;
