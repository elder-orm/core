import NumberType from '../../../src/types/number'
import { Model } from '../../../src'

describe('Number type', () => {
  test('access()', () => {
    const numberType = NumberType.create()
    const value = 21
    const result = numberType.access(value)
    expect(result).toBe(value)
  })

  test('modify() given a string', () => {
    const numberType = NumberType.create()
    const value = '21'
    const result = numberType.modify(value)
    expect(result).toBe(21)
  })

  test('modify() given an invalid string', () => {
    const numberType = NumberType.create()
    const value = 'asdasd'
    const result = () => numberType.modify(value)
    expect(result).toThrow()
  })

  test('modify() given a number', () => {
    const numberType = NumberType.create()
    const value = 21
    const result = numberType.modify(value)
    expect(result).toBe(value)
  })

  test('store()', () => {
    const numberType = NumberType.create()
    const value = 21
    const result = numberType.store(value)
    expect(result).toBe('21')
  })

  test('retrieve()', () => {
    const numberType = NumberType.create()
    const value = '21'
    const result = numberType.retrieve(value)
    expect(result).toBe(21)
  })
})
