import Elder, { Serializer, Model, type } from '../../src'
const config = { adapters: { default: { database: 'ash' } } }

describe('Serializers', () => {
  test('Serializer base class serialize() static method', () => {
    const serializer = Serializer.create()
    class Cat extends Model {
      @type('string') fizz: string
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const payload = Cat.create({ fizz: 'buzz' })

    const result = serializer.serialize(Model, payload)

    expect(result).toEqual({ fizz: 'buzz' })
  })
})
