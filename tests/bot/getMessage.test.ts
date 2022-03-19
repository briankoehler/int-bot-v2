import yaml from 'js-yaml'
import { getMessage } from '../../src/bot/getMessage'
import { TemplatesDoc } from '../../src/common/types/bot'

jest.mock('js-yaml')
const mockedYaml = jest.mocked(yaml, true)

const doc: TemplatesDoc = {
    ints: {
        '0': ['Small int - {k}/{d}/{a}'],
        '10': ['Medium int - {k}/{d}/{a}'],
        '15': ['Big int - {k}/{d}/{a}'],
        '20': ['Turbo int - {k}/{d}/{a}']
    }
}
const templates = Object.values(doc.ints)

it('generates valid messages', () => {
    mockedYaml.load.mockImplementation(() => doc)

    const params: [string, number, number, number][] = [
        ['summoner', 1, 5, 2],
        ['summoner', 1, 10, 2],
        ['summoner', 1, 15, 2],
        ['summoner', 1, 20, 2]
    ]

    params.forEach((p, i) => {
        const result = getMessage(...p)
        const expected = templates[i][0]
            .replace('{k}', p[1].toString())
            .replace('{d}', p[2].toString())
            .replace('{a}', p[3].toString())
            .replace('{s}', p[0])
            .replace('{S}', p[0].toUpperCase())

        expect(result.ok).toBe(true)
        expect(result.value).toBe(expected)
    })
})

it('fails to load from YAML file', () => {
    mockedYaml.load.mockImplementation(() => {
        throw new Error('test')
    })

    const result = getMessage('test', 10, 5, 2)

    expect(result.ok).toBe(false)
    expect(result.value).toBeInstanceOf(Error)
})
