import pkg, { SummonerStats } from '@prisma/client'
import { Result } from './types/errors'

export const isObject = (x: unknown): x is Record<string, unknown> => {
    return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export const performSafePrismaOperation = async <T>(
    callback: () => Promise<T>,
    errorMsg = ''
): Promise<Result<T>> => {
    try {
        return { ok: true, value: await callback() }
    } catch (e) {
        if (e instanceof pkg.Prisma.PrismaClientKnownRequestError) {
            return {
                ok: false,
                value: Error(
                    `${errorMsg}:\nAn error occurred when performing a Prisma operation: ${e.message}`
                )
            }
        }
        if (e instanceof pkg.Prisma.PrismaClientUnknownRequestError) {
            return {
                ok: false,
                value: Error(
                    `${errorMsg}:\nAn error occurred when performing a Prisma operation: ${e.message}`
                )
            }
        }
        if (e instanceof pkg.Prisma.PrismaClientRustPanicError) {
            return { ok: false, value: Error(`Rust panic: ${e.message}`) }
        }
        if (e instanceof pkg.Prisma.PrismaClientInitializationError) {
            return {
                ok: false,
                value: Error(
                    `${errorMsg}:\nAn error occurred when initializing Prisma: ${e.message}`
                )
            }
        }
        if (e instanceof pkg.Prisma.PrismaClientValidationError) {
            return {
                ok: false,
                value: Error(`${errorMsg}:\nAn error occurred when validating: ${e.message}`)
            }
        }
        return {
            ok: false,
            value: Error(`${errorMsg}:\nAn error occurred when performing a Prisma operation: ${e}`)
        }
    }
}

export const isSummonerStats = (x: unknown): x is SummonerStats => {
    const properties1 = [
        'id',
        'puuid',
        'match_id',
        'kills',
        'deaths',
        'assists',
        'champion',
        'position',
        'team',
        'total_time_dead',
        'challenges'
    ]
    const properties2 = [
        'id',
        'puuid',
        'matchId',
        'kills',
        'deaths',
        'assists',
        'champion',
        'position',
        'team',
        'totalTimeDead',
        'challenges'
    ]

    if (!isObject(x)) return false
    if (properties1.every(p => p in x)) {
        x.totalTimeDead = x.total_time_dead
        x.matchId = x.match_id
        return true
    }
    if (properties2.every(p => p in x)) return true
    return false
}
