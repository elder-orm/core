import Elder, {
  Serializer,
  Model,
  type,
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
describe('Serializers', () => {
  test('Serializer base class serialize() static method', () => {
    const serializer = Serializer.create()
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const payload = Cat.create({ fizz: 'buzz' })

    const result = serializer.serialize(Model, payload)

    expect(result).toEqual({ fizz: 'buzz' })
  })
})
