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
    return Cat.adapter.destroy()
  })

  test('rehydrate', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.rehydrate({ fizz: 'buzz' })

    expect(cat.state.fizz).toBe('buzz')
    return Cat.adapter.destroy()
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
    return Cat.adapter.destroy()
  })

  test('runTypeHooks:access', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'access')

    expect(result).toEqual({ fizz: 'buzz' })
    return Cat.adapter.destroy()
  })

  test('runTypeHooks:modify', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'modify')

    expect(result).toEqual({ fizz: 'buzz' })
    return Cat.adapter.destroy()
  })

  test('runTypeHooks:retrieve', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'retrieve')

    expect(result).toEqual({ fizz: 'buzz' })
    return Cat.adapter.destroy()
  })

  test('runTypeHooks:store', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const result = Cat.runTypeHooks({ fizz: 'buzz', fake: 'prop' }, 'store')

    expect(result).toEqual({ fizz: 'buzz' })
    return Cat.adapter.destroy()
  })

  test('populate', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.populate({ fizz: 'buzz', fake: 'prop', id: 1 })

    expect(cat.state).toEqual({ fizz: 'buzz', id: 1 })
    return Cat.adapter.destroy()
  })

  test('toJSON', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.populate({ fizz: 'buzz', fake: 'prop', id: 1 })

    expect(cat.toJSON()).toEqual({ fizz: 'buzz', id: 1 })
    return Cat.adapter.destroy()
  })

  test('serialize:implicit', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.populate({ fizz: 'buzz', fake: 'prop', id: 1 })

    expect(cat.serialize()).toEqual({ fizz: 'buzz', id: 1 })
    return Cat.adapter.destroy()
  })

  test('serialize:default', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    cat.populate({ fizz: 'buzz', fake: 'prop', id: 1 })

    expect(cat.serialize('default')).toEqual({ fizz: 'buzz', id: 1 })
    return Cat.adapter.destroy()
  })

  test('ctor', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()

    expect(cat.ctor).toBe(Cat)
    return Cat.adapter.destroy()
  })

  test('serializers', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()

    expect(cat.serializers.default).toBeInstanceOf(Serializer)
    return Cat.adapter.destroy()
  })

  test('plural', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)

    expect(Cat.plural).toBe('cats')
    return Cat.adapter.destroy()
  })

  test('plural:overwritten', () => {
    class Cat extends Model {
      static plural = 'catz'
      @type('string') fizz: string
    }
    setupModel(Cat)

    expect(Cat.plural).toBe('catz')
    return Cat.adapter.destroy()
  })

  test('tableName', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)

    expect(Cat.tableName).toBe('cat')
    return Cat.adapter.destroy()
  })

  test('tableName:overwritten', () => {
    class Cat extends Model {
      static tableName = 'cats'
      @type('string') fizz: string
    }
    setupModel(Cat)

    expect(Cat.tableName).toBe('cats')
    return Cat.adapter.destroy()
  })

  test('modelName', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)

    expect(Cat.modelName).toBe('cat')
    return Cat.adapter.destroy()
  })

  test('modelName:overwritten', () => {
    class Cat extends Model {
      static modelName = 'kitty'
      @type('string') fizz: string
    }
    setupModel(Cat)

    expect(Cat.modelName).toBe('kitty')
    return Cat.adapter.destroy()
  })

  test('adapter', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create()

    expect(cat.adapter).toBeInstanceOf(PostgresAdapter)
    return Cat.adapter.destroy()
  })

  test('toString', () => {
    class Cat extends Model {
      @type('string') fizz: string
    }
    setupModel(Cat)
    const cat = Cat.create({ fizz: 'buzz' })

    expect(cat.toString()).toBe(`Cat {fizz: 'buzz'}`)
    return Cat.adapter.destroy()
  })

  test('define property setup performed', () => {
    class Cat extends Model {
      @type('string') str: string
    }
    setupModel(Cat)
    const cat = Cat.create()
    expect(cat.str).toBe(null)
    cat.str = 'hello'
    expect(cat.str).toBe('hello')
    return Cat.adapter.destroy()
  })
})
