import express from 'express'
import { summonerStats } from '../../../src/server/controllers'
import * as errors from '../../prismaErrors'
import { prismaMock } from '../../testUtil'
import request = require('supertest')

jest.mock('@prisma/client', () => ({
    __esmodule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(jest.requireActual('@prisma/client') as any),
    Prisma: {
        PrismaClientKnownRequestError: jest.fn().mockImplementation(() => {
            return Object.create(errors.PrismaClientKnownRequestError.prototype)
        }),
        PrismaClientUnknownRequestError: jest.fn().mockImplementation(() => {
            return Object.create(errors.PrismaClientUnknownRequestError.prototype)
        }),
        PrismaClientRustPanicError: jest.fn().mockImplementation(() => {
            return Object.create(errors.PrismaClientRustPanicError.prototype)
        }),
        PrismaClientInitializationError: jest.fn().mockImplementation(() => {
            return Object.create(errors.PrismaClientInitializationError.prototype)
        }),
        PrismaClientValidationError: jest.fn().mockImplementation(() => {
            return Object.create(errors.PrismaClientValidationError.prototype)
        })
    }
}))

const app = express()

beforeAll(async () => {
    app.use(express.json())
    app.use('/summonerStats', summonerStats)
})

describe('fetch all summonerStats', () => {
    it('fetches all summonerStats', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.findMany.mockResolvedValue(['value'])

        const resp = await request(app).get('/summonerStats/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(['value'])
    })

    it('returns an empty array if no summonerStats exist', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.findMany.mockResolvedValue([])

        const resp = await request(app).get('/summonerStats/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([])
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.findMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).get('/summonerStats/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete all summonerStats', () => {
    it('deletes all summonerStats', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.deleteMany.mockResolvedValue({})

        const resp = await request(app).delete('/summonerStats/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.deleteMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/summonerStats/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete a specific summonerStats', () => {
    it('deletes a specific summonerStats', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.delete.mockResolvedValue({})

        const resp = await request(app).delete('/summonerStats/abcd1234')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summonerStats.delete.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/summonerStats/abcd1234')
        expect(resp.statusCode).toBe(500)
    })
})
