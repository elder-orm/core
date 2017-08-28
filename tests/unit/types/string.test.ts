import StringType from '../../../src/types/string'
import { Model } from '../../../src'

describe('String type', () => {
  test('access()', () => {
    const stringType = StringType.create()
    const value = 'a string'
    const result = stringType.access(value)
    expect(result).toBe(value)
  })

  test('modify() given a string', () => {
    const stringType = StringType.create()
    const value = 'a string'
    const result = stringType.modify(value)
    expect(result).toBe(value)
  })

  test('modify() given a number', () => {
    const stringType = StringType.create()
    const value = 21
    const result = stringType.modify(value)
    expect(result).toBe('21')
  })

  test('store()', () => {
    const stringType = StringType.create()
    const value = 'a string'
    const result = stringType.store(value)
    expect(result).toBe(value)
  })

  test('retrieve()', () => {
    const stringType = StringType.create()
    const value = 'a string'
    const result = stringType.retrieve(value)
    expect(result).toBe(value)
  })
})
