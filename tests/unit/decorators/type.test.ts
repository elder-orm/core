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

    expect(Cat.meta.attributeDefinition).toEqual({
      str: { type: 'string' },
      num: { type: 'number' },
      dat: { type: 'date' },
      bol: { type: 'boolean' }
    })

    expect(Model.meta.attributeDefinition).toEqual({})
  })

  test('errors if default value for property is used', () => {
    const subject = () => {
      class Cat extends Model {
        @type('string') str: string = 'a default'
      }
    }

    expect(subject).toThrow()
  })
})
