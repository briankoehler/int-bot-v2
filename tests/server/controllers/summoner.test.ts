import express from 'express'
import { summoner } from '../../../src/server/controllers'
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
    app.use('/summoner', summoner)
})

describe('fetch all summoners', () => {
    it('fetches all summoners', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findMany.mockResolvedValue(['value'])

        const resp = await request(app).get('/summoner/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(['value'])
    })

    it('returns an empty array if no summoners exist', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findMany.mockResolvedValue([])

        const resp = await request(app).get('/summoner/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([])
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).get('/summoner/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('fetch summoner by puuid', () => {
    it('fetches summoner by puuid', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findFirst.mockResolvedValue({ puuid: 'value' })

        const resp = await request(app).get('/summoner/123')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({ puuid: 'value' })
    })

    it('returns a 404 if no summoner exists', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findFirst.mockResolvedValue(null)

        const resp = await request(app).get('/summoner/123')
        expect(resp.statusCode).toBe(404)
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findFirst.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).get('/summoner/123')
        expect(resp.statusCode).toBe(500)
    })
})

describe('post a summoner', () => {
    it('successfully creates a summoner', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.create.mockResolvedValue({})

        const resp = await request(app).post('/summoner')
        expect(resp.statusCode).toBe(201)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.create.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).post('/summoner')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete a specific summoner', () => {
    it('deletes a specific summoner', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.delete.mockResolvedValue({})

        const resp = await request(app).delete('/summoner/abcd1234')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.delete.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/summoner/abcd1234')
        expect(resp.statusCode).toBe(500)
    })
})
