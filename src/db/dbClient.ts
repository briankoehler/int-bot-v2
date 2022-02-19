import pkg from '@prisma/client'

const { PrismaClient } = pkg

const DbClient = {
    instance: new PrismaClient()
}

export type IDbClient = typeof DbClient

Object.freeze(DbClient)

export default DbClient
