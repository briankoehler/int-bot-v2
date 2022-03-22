import { handleResult, Result } from '../../../src/common/types/errors'

describe('handleResult', () => {
    it('returns value on an ok response', () => {
        const result: Result<string> = { ok: true, value: 'foo' }
        expect(handleResult(result)).toBe('foo')
    })

    it('throws ok non-ok response', () => {
        const result: Result<string> = { ok: false, value: new Error('foo') }
        expect(() => handleResult(result)).toThrow('foo')
    })

    it('throws a non-error when specified on non-ok response', () => {
        const result: Result<string, string> = { ok: false, value: 'foo' }
        expect(() => handleResult(result)).toThrow('foo')
    })
})
