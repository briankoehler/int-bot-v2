import express from 'express'
import { match } from '../../../src/server/controllers'
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
    app.use('/match', match)
})

describe('fetch all matches', () => {
    it('fetches all matches', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.findMany.mockResolvedValue(['value'])

        const resp = await request(app).get('/match/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(['value'])
    })

    it('returns an empty array if no matches exist', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.findMany.mockResolvedValue([])

        const resp = await request(app).get('/match/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([])
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.findMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).get('/match/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete all matches', () => {
    it('deletes all matches', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.deleteMany.mockResolvedValue({})

        const resp = await request(app).delete('/match/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.deleteMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/match/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete a specific match', () => {
    it('deletes a specific match', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.delete.mockResolvedValue({})

        const resp = await request(app).delete('/match/abcd1234')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.match.delete.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/match/abcd1234')
        expect(resp.statusCode).toBe(500)
    })
})
