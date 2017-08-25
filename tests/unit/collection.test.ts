import Elder, { Serializer, Model, type, Collection } from '../../src'
const config = { adapters: { default: { database: 'ash' } } }

describe('Collection', () => {
  test('Collection class serialize() method', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const payload = Cat.create({ fizz: 'buzz' })
    const collection = new Collection(payload)

    const result = collection.serialize()

    expect(result).toEqual([{ fizz: 'buzz' }])
  })
})
