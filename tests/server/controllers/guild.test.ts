import express from 'express'
import { guild } from '../../../src/server/controllers'
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
    app.use('/guild', guild)
})

describe('fetch all guilds', () => {
    it('fetches all guilds', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.findMany.mockResolvedValue(['value'])

        const resp = await request(app).get('/guild/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(['value'])
    })

    it('returns an empty array if no guilds exist', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.findMany.mockResolvedValue([])

        const resp = await request(app).get('/guild/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([])
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.findMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).get('/guild/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete all guilds', () => {
    it('deletes all guilds', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.deleteMany.mockResolvedValue({})

        const resp = await request(app).delete('/guild/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.deleteMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/guild/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete a specific guild', () => {
    it('deletes a specific guild', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.delete.mockResolvedValue({})

        const resp = await request(app).delete('/guild/abcd1234')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guild.delete.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/guild/abcd1234')
        expect(resp.statusCode).toBe(500)
    })
})
