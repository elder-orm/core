import type from '../../src/decorators/type'
import { Model } from '../../src'

describe('@type() decorator', () => {
  test('basic decorators', () => {
    class Cat extends Model {
      @type('string') str: string
      @type('number') num: string
      @type('date') dat: string
      @type('boolean') bol: string
    }

    expect(Cat.meta.attributeDefinition).toEqual({
      str: 'string',
      num: 'number',
      dat: 'date',
      bol: 'boolean'
    })
  })
})
