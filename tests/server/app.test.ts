import { app } from '../../src/server/app'
import { prismaMock } from '../testUtil'
import request = require('supertest')

describe('summoners', () => {
    it('provides summoners', async () => {
        // @ts-ignore - Bad Prisma typing
        prismaMock.summoner.findMany.mockResolvedValue(['value'])

        const resp = await request(app).get('/summoner/all')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(['value'])
    })
})

it('provides a summoner by puuid', async () => {
    // @ts-ignore - Bad Prisma typing
    prismaMock.summoner.findFirst.mockResolvedValue({ puuid: 'puuid' })

    const resp = await request(app).get('/summoner/abcd1234')
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toEqual({ puuid: 'puuid' })
})
