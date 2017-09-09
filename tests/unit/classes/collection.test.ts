import Elder, {
  Serializer,
  Model,
  type,
  Collection,
  Adapter,
  StringType,
  NumberType
} from '../../../src'
const config = { adapters: { default: { database: 'ash' } } }
const adapterConfig = config.adapters.default

function setupModel(Ctor: typeof Model) {
  const adapter = Adapter.create(adapterConfig)
  const serializer = Serializer.create()
  Ctor.setup(
    { string: new StringType(), number: new NumberType() },
    { default: adapter },
    { default: serializer }
  )
}

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
    setupModel(Cat)
    const payload = Cat.create({ fizz: 'buzz' })
    const collection = new Collection(payload)

    const result = collection.serialize()

    expect(result).toEqual([{ fizz: 'buzz' }])
  })
})
