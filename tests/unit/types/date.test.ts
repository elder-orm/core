import DateType from '../../../src/types/date'
import { Model } from '../../../src'

describe('Date type', () => {
  test('access()', () => {
    const dateType = DateType.create()
    const value = new Date()
    const result = dateType.access(value, {})
    expect(result).toBe(value)
  })

  test('modify() - date object', () => {
    const dateType = DateType.create()
    const value = new Date()
    const result = dateType.modify(value, {})
    expect(result).toBe(value)
  })

  test('modify() - date string', () => {
    const dateType = DateType.create()
    const value = new Date().toISOString()
    const result = dateType.modify(value, {})
    expect(result.toISOString()).toBe(value)
  })

  test('modify() - invalid date string', () => {
    const dateType = DateType.create()
    const value = 'asdasdas'
    const result = () => dateType.modify(value, {})
    expect(result).toThrow()
  })

  test('store()', () => {
    const dateType = DateType.create()
    const value = new Date()
    const result = dateType.store(value, {})
    expect(result).toBe(value.toISOString())
  })

  test('retrieve()', () => {
    const dateType = DateType.create()
    const value = new Date().toISOString()
    const result = dateType.retrieve(value, {})
    expect(result.toISOString()).toBe(value)
  })
})
