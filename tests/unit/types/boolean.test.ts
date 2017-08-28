import BooleanType from '../../../src/types/boolean'
import { Model } from '../../../src'

describe('Boolean type', () => {
  test('access()', () => {
    const booleanType = BooleanType.create()
    const value = true
    const result = booleanType.access(value)
    expect(result).toBe(value)
  })

  test('modify() - string:FALSE', () => {
    const booleanType = BooleanType.create()
    const value = 'FALSE'
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - string:TRUE', () => {
    const booleanType = BooleanType.create()
    const value = 'TRUE'
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - string:false', () => {
    const booleanType = BooleanType.create()
    const value = 'false'
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - string:true', () => {
    const booleanType = BooleanType.create()
    const value = 'true'
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - string:f', () => {
    const booleanType = BooleanType.create()
    const value = 'f'
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - string:t', () => {
    const booleanType = BooleanType.create()
    const value = 't'
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - string:F', () => {
    const booleanType = BooleanType.create()
    const value = 'F'
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - string:T', () => {
    const booleanType = BooleanType.create()
    const value = 'T'
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - string:0', () => {
    const booleanType = BooleanType.create()
    const value = '0'
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - string:1', () => {
    const booleanType = BooleanType.create()
    const value = '1'
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - number:0', () => {
    const booleanType = BooleanType.create()
    const value = 0
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - number:1', () => {
    const booleanType = BooleanType.create()
    const value = 1
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - boolean:false', () => {
    const booleanType = BooleanType.create()
    const value = false
    const result = booleanType.modify(value)
    expect(result).toBe(false)
  })

  test('modify() - boolean:true', () => {
    const booleanType = BooleanType.create()
    const value = true
    const result = booleanType.modify(value)
    expect(result).toBe(true)
  })

  test('modify() - throws TypeError', () => {
    const booleanType = BooleanType.create()
    const value = 'asdasd'
    const result = () => booleanType.modify(value)
    expect(result).toThrow()
  })

  test('store()', () => {
    const booleanType = BooleanType.create()
    const value = true
    const result = booleanType.store(value)
    expect(result).toBe('TRUE')
  })

  test('retrieve() - string:FALSE', () => {
    const booleanType = BooleanType.create()
    const value = 'FALSE'
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - string:TRUE', () => {
    const booleanType = BooleanType.create()
    const value = 'TRUE'
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - string:false', () => {
    const booleanType = BooleanType.create()
    const value = 'false'
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - string:true', () => {
    const booleanType = BooleanType.create()
    const value = 'true'
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - string:f', () => {
    const booleanType = BooleanType.create()
    const value = 'f'
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - string:t', () => {
    const booleanType = BooleanType.create()
    const value = 't'
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - string:F', () => {
    const booleanType = BooleanType.create()
    const value = 'F'
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - string:T', () => {
    const booleanType = BooleanType.create()
    const value = 'T'
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - string:0', () => {
    const booleanType = BooleanType.create()
    const value = '0'
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - string:1', () => {
    const booleanType = BooleanType.create()
    const value = '1'
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - number:0', () => {
    const booleanType = BooleanType.create()
    const value = 0
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - number:1', () => {
    const booleanType = BooleanType.create()
    const value = 1
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - boolean:false', () => {
    const booleanType = BooleanType.create()
    const value = false
    const result = booleanType.retrieve(value)
    expect(result).toBe(false)
  })

  test('retrieve() - boolean:true', () => {
    const booleanType = BooleanType.create()
    const value = true
    const result = booleanType.retrieve(value)
    expect(result).toBe(true)
  })

  test('retrieve() - throws TypeError', () => {
    const booleanType = BooleanType.create()
    const value = 'asdasd'
    const result = () => booleanType.retrieve(value)
    expect(result).toThrow()
  })
})
