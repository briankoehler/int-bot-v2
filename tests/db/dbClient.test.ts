it('successfully imports', async () => {
    const { prisma } = await import('../../src/db/dbClient')
    expect(prisma).toBeTruthy()
})

it('fails to import a non-exported value', async () => {
    // @ts-expect-error - this is an invalid import
    const { test } = await import('../../src/db/dbClient')
    expect(test).toBeFalsy()
})
