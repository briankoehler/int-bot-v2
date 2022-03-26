import express from 'express'
import { guildFollowing } from '../../../src/server/controllers'
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
    app.use('/guildfollowing', guildFollowing)
})

describe('fetch all guilds follows', () => {
    it('fetches all guild follows', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.findMany.mockResolvedValue(['value'])

        const resp = await request(app).get('/guildfollowing/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(['value'])
    })

    it('returns an empty array if no relationships exist', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.findMany.mockResolvedValue([])

        const resp = await request(app).get('/guildfollowing/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([])
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.findMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).get('/guildfollowing/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete all guilds follows', () => {
    it('deletes all guilds follows', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.deleteMany.mockResolvedValue({})

        const resp = await request(app).delete('/guildfollowing/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.deleteMany.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/guildfollowing/all')
        expect(resp.statusCode).toBe(500)
    })
})

describe('delete a specific guild follows', () => {
    it('deletes a specific guild follows', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.delete.mockResolvedValue({})

        const resp = await request(app).delete('/guildfollowing/abcd1234')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.delete.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).delete('/guildfollowing/abcd1234')
        expect(resp.statusCode).toBe(500)
    })
})

describe('post a following relationship', () => {
    it('successfully creates a relationship', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.create.mockResolvedValue({})

        const resp = await request(app).post('/guildfollowing')
        expect(resp.statusCode).toBe(201)
        expect(resp.body).toEqual({})
    })

    it('returns a 500 if the database fails', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.guildFollowing.create.mockRejectedValue(
            new errors.PrismaClientKnownRequestError('error', 'code', 'clientVersion')
        )

        const resp = await request(app).post('/guildfollowing')
        expect(resp.statusCode).toBe(500)
    })
})
