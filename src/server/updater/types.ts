
export namespace DataDragonResponse {
    export interface ChampionResponse {
        type: 'champion',
        data: {
            [key: string]: {
                key: string,
                name: string
            }
        }
    }

    interface Queue {
        queueId: number,
        map: string,
        description: string | null
    }

    export type QueueResponse = Queue[]

    export type VersionResponse = string[]
}

export namespace RiotResponse {
    export interface SummonerResponse {
        id: string,
        accountId: string,
        puuid: string,
        name: string,
        profileIconId: number,
        revisionDate: number,
        summonerLevel: number
    }

    export interface ErrorResponse {
        status: {
            message: string,
            status_code: number
        }
    }

    export interface MatchResponse {
        metadata: {
            matchId: string,
            participants: string[],
        },
        info: {
            gameCreation: number,
            gameDuration: number,
            gameEndTimestamp: number,
            gameId: number,
            gameMode: string,
            gameStartTimestamp: number,
            gameType: string,
            gameVersion: string,
            mapId: number,
            participants: ParticipantData[]
        }
    }

    interface ParticipantData {
        assists: number,
        baronKills: number,
        bountyLevel: number,
        challenges: {
            [key: string]: number
        },
        champExperience: number,
        champLevel: number,
        championId: number,
        championName: string,
        championTransform: number,
        consumablesPurchased: number,
        damageDealtToBuildings: number,
        damageDealtToObjectives: number,
        damageDealtToTurrets: number,
        damageSelfMitigated: number,
        deaths: number,
        detectorWardsPlaced: number,
        doubleKills: number,
        dragonKills: number,
        firstBloodAssist: boolean,
        firstBloodKill: boolean,
        firstTowerAssist: boolean,
        firstTowerKill: boolean,
        gameEndedInEarlySurrender: boolean,
        gameEndedInSurrender: boolean,
        goldEarned: number,
        goldSpent: number,
        individualPosition: string,
        inhibitorKills: number,
        inhibitorTakedowns: number,
        inhibitorsLost: number,
        item0: number,
        item1: number,
        item2: number,
        item3: number,
        item4: number,
        item5: number,
        item6: number,
        itemsPurchased: number,
        killingSprees: number,
        kills: number,
        lane: string,
        largestCriticalStrike: number,
        largestKillingSpree: number,
        largestMultiKill: number,
        longestTimeSpentLiving: number,
        magicDamageDealt: number,
        magicDamageDealtToChampions: number,
        magicDamageTaken: number,
        neutralMinionsKilled: number,
        nexusKills: number,
        nexusLost: number,
        nexusTakedowns: number,
        objectivesStolen: number,
        objectivesStolenAssists: number,
        participantId: number,
        pentaKills: number,
        perks: unknown,
        physicalDamageDealt: number,
        physicalDamageDealtToChampions: number,
        physicalDamageTaken: number,
        profileIcon: number,
        puuid: string,
        quadraKills: number,
        riotIdName: string,
        riotIdTagline: string,
        role: string,
        sightWardsBoughtInGame: number,
        spell1Casts: number,
        spell2Casts: number,
        spell3Casts: number,
        spell4Casts: number,
        summoner1Casts: number,
        summoner1Id: string,
        summoner2Casts: number,
        summoner2Id: string,
        summonerId: string,
        summonerLevel: number,
        summonerName: string,
        teamEarlySurrendered: boolean,
        teamId: number,
        teamPosition: string,
        timeCCingOthers: number,
        timePlayed: number,
        totalDamageDealt: number,
        totalDamageDealtToChampions: number,
        totalDamageShieldedOnTeammates: number,
        totalDamageTaken: number,
        totalHeal: number,
        totalHealOnTeammates: number,
        totalMinionsKilled: number,
        totalTimeCCDealt: number,
        totalTimeSpentDead: number,
        totalUnitsHealed: number,
        tripleKills: number,
        trueDamageDealt: number,
        truedamageDealtToChampions: number,
        trueDamageTaken: number,
        turretKills: number,
        turretTakedowns: number,
        turretsLost: number,
        unrealKills: number,
        visionScore: number,
        visionWardsBoughtInGame: number,
        wardsKilled: number,
        wardsPlaced: number,
        win: boolean
    }

    export type MatchIdsResponse = string[]
}
