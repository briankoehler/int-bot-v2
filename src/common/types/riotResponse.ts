import { isObject } from '../helpers'

export interface SummonerResponse {
    id: string
    accountId: string
    puuid: string
    name: string
    profileIconId: number
    revisionDate: number
    summonerLevel: number
}

export interface ErrorResponse {
    status: {
        message: string
        status_code: number
    }
}

export interface MatchResponse {
    metadata: {
        matchId: string
        participants: string[]
    }
    info: {
        gameCreation: number
        gameDuration: number
        gameEndTimestamp: number
        gameId: number
        gameMode: string
        gameStartTimestamp: number
        gameType: string
        gameVersion: string
        mapId: number
        queueId: number
        participants: ParticipantData[]
    }
}

export interface ParticipantData {
    assists: number
    baronKills: number
    bountyLevel: number
    challenges: {
        [key: string]: number
    }
    champExperience: number
    champLevel: number
    championId: number
    championName: string
    championTransform: number
    consumablesPurchased: number
    damageDealtToBuildings: number
    damageDealtToObjectives: number
    damageDealtToTurrets: number
    damageSelfMitigated: number
    deaths: number
    detectorWardsPlaced: number
    doubleKills: number
    dragonKills: number
    firstBloodAssist: boolean
    firstBloodKill: boolean
    firstTowerAssist: boolean
    firstTowerKill: boolean
    gameEndedInEarlySurrender: boolean
    gameEndedInSurrender: boolean
    goldEarned: number
    goldSpent: number
    individualPosition: string
    inhibitorKills: number
    inhibitorTakedowns: number
    inhibitorsLost: number
    item0: number
    item1: number
    item2: number
    item3: number
    item4: number
    item5: number
    item6: number
    itemsPurchased: number
    killingSprees: number
    kills: number
    lane: string
    largestCriticalStrike: number
    largestKillingSpree: number
    largestMultiKill: number
    longestTimeSpentLiving: number
    magicDamageDealt: number
    magicDamageDealtToChampions: number
    magicDamageTaken: number
    neutralMinionsKilled: number
    nexusKills: number
    nexusLost: number
    nexusTakedowns: number
    objectivesStolen: number
    objectivesStolenAssists: number
    participantId: number
    pentaKills: number
    perks: unknown
    physicalDamageDealt: number
    physicalDamageDealtToChampions: number
    physicalDamageTaken: number
    profileIcon: number
    puuid: string
    quadraKills: number
    riotIdName: string
    riotIdTagline: string
    role: string
    sightWardsBoughtInGame: number
    spell1Casts: number
    spell2Casts: number
    spell3Casts: number
    spell4Casts: number
    summoner1Casts: number
    summoner1Id: string
    summoner2Casts: number
    summoner2Id: string
    summonerId: string
    summonerLevel: number
    summonerName: string
    teamEarlySurrendered: boolean
    teamId: number
    teamPosition: string
    timeCCingOthers: number
    timePlayed: number
    totalDamageDealt: number
    totalDamageDealtToChampions: number
    totalDamageShieldedOnTeammates: number
    totalDamageTaken: number
    totalHeal: number
    totalHealOnTeammates: number
    totalMinionsKilled: number
    totalTimeCCDealt: number
    totalTimeSpentDead: number
    totalUnitsHealed: number
    tripleKills: number
    trueDamageDealt: number
    truedamageDealtToChampions: number
    trueDamageTaken: number
    turretKills: number
    turretTakedowns: number
    turretsLost: number
    unrealKills: number
    visionScore: number
    visionWardsBoughtInGame: number
    wardsKilled: number
    wardsPlaced: number
    win: boolean
}

export type MatchIdsResponse = string[]

/* Type Guards */

export const isSummonerResponse = (response: unknown): response is SummonerResponse => {
    if (!isObject(response)) return false
    const properties = [
        ['id', 'string'],
        ['accountId', 'string'],
        ['puuid', 'string'],
        ['name', 'string'],
        ['profileIconId', 'number'],
        ['revisionDate', 'number'],
        ['summonerLevel', 'number']
    ]
    return properties.every(p => p[0] in response && typeof response[p[0]] === p[1])
}

export const isErrorResponse = (response: unknown): response is ErrorResponse => {
    if (!isObject(response)) return false
    if (!isObject(response.status)) return false

    if ('message' in response.status && 'status_code' in response.status) return true
    return false
}

export const isMatchIdsResponse = (response: unknown): response is MatchIdsResponse => {
    return Array.isArray(response) && response.every(id => typeof id === 'string')
}

export const isMatchResponse = (response: unknown): response is MatchResponse => {
    if (!isObject(response)) return false
    if (!isObject(response.metadata)) return false

    if (!('metadata' in response) || !('info' in response)) return false
    if (!('matchId' in response.metadata) || !('participants' in response.metadata)) return false

    const properties = [
        'gameCreation',
        'gameDuration',
        'gameEndTimestamp',
        'gameId',
        'gameMode',
        'gameStartTimestamp',
        'gameType',
        'gameVersion',
        'mapId',
        'participants',
        'queueId'
    ]
    return properties.every(p => isObject(response.info) && p in response.info)
}
