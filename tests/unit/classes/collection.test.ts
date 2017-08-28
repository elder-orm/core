import Elder, { Serializer, Model, type, Collection } from '../../../src'
const config = { adapters: { default: { database: 'ash' } } }

describe('Collection', () => {
  test('converting to pojo', () => {
    const models = [{ fizz: 'buzz' }, { foo: 'bar' }]
    const collection = new Collection(...models)
    const json = JSON.parse(JSON.stringify(collection))
    expect(json).toEqual(models)
  })

  test('create(...item) method', () => {
    const collection = Collection.create({ fizz: 'buzz' }, { foo: 'bar' })
    expect(collection).toEqual([{ fizz: 'buzz' }, { foo: 'bar' }])
  })

  test('serialize() model collection', () => {
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
