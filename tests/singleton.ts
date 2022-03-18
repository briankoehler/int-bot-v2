import { PrismaClient } from '@prisma/client'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { prisma } from '../src/db/dbClient'

jest.mock('../src/db/dbClient', () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
    mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
