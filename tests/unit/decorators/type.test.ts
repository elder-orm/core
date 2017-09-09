import type from '../../../src/decorators/type'
import { Model } from '../../../src'

describe('@type() decorator', () => {
  test('basic decorators', () => {
    class Cat extends Model {
      @type('string') str: string
      @type('number') num: string
      @type('date') dat: string
      @type('boolean') bol: string
    }

    expect(Cat.meta.attributes).toEqual({
      str: { type: 'string' },
      num: { type: 'number' },
      dat: { type: 'date' },
      bol: { type: 'boolean' }
    })

    expect(Model.meta.attributes).toEqual({})
  })

  test('errors if default value for property is used', () => {
    const subject = () => {
      class Cat extends Model {
        @type('string') str: string = 'a default'
      }
    }

    expect(subject).toThrow()
  })

  test('decorators passing options', () => {
    class Cat extends Model {
      @type('string', { foo: 'bar' })
      str: string
      @type('number', { foo: 'bar' })
      num: string
      @type('date', { foo: 'bar' })
      dat: string
      @type('boolean', { foo: 'bar' })
      bol: string
    }

    expect(Cat.meta.attributes).toEqual({
      str: { type: 'string', foo: 'bar' },
      num: { type: 'number', foo: 'bar' },
      dat: { type: 'date', foo: 'bar' },
      bol: { type: 'boolean', foo: 'bar' }
    })

    expect(Model.meta.attributes).toEqual({})
  })

  test('decorator throws if illegal key type is used', () => {
    const expression = () => {
      class Cat extends Model {
        @type('string', { type: 'bar' })
        str: string
      }
    }

    expect(expression).toThrow()
  })
})
