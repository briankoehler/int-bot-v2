import { config } from '../src/config'

it('loads default values', () => {
    Object.entries(config).forEach(([, value]) => {
        expect(value).toBeDefined()
        expect(value).toBeTruthy()
    })
})
