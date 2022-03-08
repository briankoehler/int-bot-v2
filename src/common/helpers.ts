import { Prisma } from '@prisma/client'
import { Result } from './types/errors'

export const isObject = (x: unknown): x is Record<string, unknown> => {
    return typeof x === 'object' && x !== null
}

export const performSafePrismaOperation = async <T>(
    callback: () => Promise<T>,
    errorMsg = ''
): Promise<Result<T>> => {
    try {
        return {
            ok: true,
            value: await callback()
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return {
                ok: false,
                value: Error(
                    `${errorMsg}:\nAn error occurred when performing a Prisma operation: ${e.message}`
                )
            }
        }
        if (e instanceof Prisma.PrismaClientUnknownRequestError) {
            return {
                ok: false,
                value: Error(
                    `${errorMsg}:\nAn error occurred when performing a Prisma operation: ${e.message}`
                )
            }
        }
        if (e instanceof Prisma.PrismaClientRustPanicError) {
            return { ok: false, value: Error(`Rust panic: ${e.message}`) }
        }
        if (e instanceof Prisma.PrismaClientInitializationError) {
            return {
                ok: false,
                value: Error(
                    `${errorMsg}:\nAn error occurred when initializing Prisma: ${e.message}`
                )
            }
        }
        if (e instanceof Prisma.PrismaClientValidationError) {
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
