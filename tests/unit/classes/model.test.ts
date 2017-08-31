import Elder, {
  StringType,
  NumberType,
  PostgresAdapter,
  Serializer,
  Model,
  type
} from '../../../src'
const config = { adapters: { default: { database: 'ash' } } }
const adapterConfig = config.adapters.default

function setupModel(Ctor: typeof Model) {
  const adapter = PostgresAdapter.create(adapterConfig)
  const serializer = Serializer.create()
  Ctor.setup(
    { string: new StringType(), number: new NumberType() },
    { default: adapter },
    { default: serializer }
  )
}

describe('Models', () => {
  test('hydrate', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.hydrate({ fizz: 'buzz' })

    expect(cat.fizz).toEqual('buzz')
  })

  test('rehydrate', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.rehydrate({ fizz: 'buzz' })

    expect(cat.state.fizz).toBe('buzz')
  })

  test('dehydrate', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.state.fizz = 'buzz'
    const result = cat.dehydrate()

    expect(result.fizz).toBe('buzz')
  })

  test('runInHooks:access', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'access')

    expect(result).toEqual({ fizz: 'buzz' })
  })

  test('runInHooks:modify', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'modify')

    expect(result).toEqual({ fizz: 'buzz' })
  })

  test('runInHooks:retrieve', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'retrieve')

    expect(result).toEqual({ fizz: 'buzz' })
  })

  test('runInHooks:store', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'store')

    expect(result).toEqual({ fizz: 'buzz' })
  })

  test('populate', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.populate({ fizz: 'buzz', fake: 'prop', id: 1 })

    expect(cat.state).toEqual({ fizz: 'buzz', id: 1 })
  })

  test('toJSON', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.populate({ fizz: 'buzz', fake: 'prop', id: 1 })

    expect(cat.toJSON()).toEqual({ fizz: 'buzz', id: 1 })
  })
})
