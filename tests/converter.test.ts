import axios from 'axios'
import { Converter } from '../src/server/updater/converter'

jest.mock('axios')

it('throws an error when not initialized', async () => {
    await expect(Converter.convertChampionIdToName(2)).rejects.toThrow()
    await expect(Converter.convertQueueIdToNameAndMap(2)).rejects.toThrow()
})

it('converts id successfully', async () => {
    ;(axios.get as jest.Mock)
        .mockResolvedValueOnce({
            data: ['12.4.1', '12.3.1', '12.2.1'],
            status: 200,
        })
        .mockResolvedValueOnce({
            data: {
                type: 'champion',
                data: {
                    Aatrox: { key: 55, name: 'Aatrox' },
                    MasterYi: { key: 32, name: 'Master Yi' },
                    AurelionSol: { key: 999, name: 'Aurelion Sol' },
                },
            },
            status: 200,
        })
        .mockResolvedValueOnce({
            data: [
                { queueId: 23, map: 'Rift', description: '5v5 Blind' },
                { queueId: 21, map: 'Abyss', description: '5v5 ARAM' },
                { queueId: 7, map: 'Scar', description: '5v5 Dominion' },
            ],
            status: 200,
        })

    await Converter.init()
    await expect(Converter.convertQueueIdToNameAndMap(21)).resolves.toStrictEqual([
        '5v5 ARAM',
        'Abyss',
    ])
    await expect(Converter.convertChampionIdToName(999)).resolves.toBe('Aurelion Sol')
})
