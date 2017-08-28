import Elder, {
  StringType,
  PostgresAdapter,
  Serializer,
  Model,
  type
} from '../../src'
import * as Knex from 'knex'
import { development } from '../../knexfile'

import config from '../config'
const adapterConfig = config.adapters.default

const knex = Knex(development)

beforeEach(async () => {
  await knex('cat').truncate()
  await knex.migrate.latest(development.migrations)
  return knex.seed.run(development.migrations)
})

afterAll(() => {
  knex.destroy()
})

function setupModel(Ctor: typeof Model) {
  const adapter = PostgresAdapter.create(adapterConfig)
  const serializer = Serializer.create()
  Ctor.setup(
    { string: new StringType() },
    { default: adapter },
    { default: serializer }
  )
}

describe('Working with adapters', () => {
  test('Checking the connection to the database', async () => {
    const adapter = PostgresAdapter.create(adapterConfig)
    await adapter.checkConnection()
    return adapter.destroy()
  })

  test('An error is thrown when the connection fails', async () => {
    const adapter = PostgresAdapter.create({ database: 'doesnotexist' })
    try {
      await adapter.checkConnection()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
    }
    return adapter.destroy()
  })

  test('The connection tears down properly', async () => {
    const adapter = PostgresAdapter.create(adapterConfig)
    return adapter.destroy()
  })

  test('The all() method returns an array of data', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    const adapter = PostgresAdapter.create(adapterConfig)
    const cats = await adapter.all(Cat)

    expect(Array.isArray(cats)).toBe(true)
    expect(cats[0].name).toBe('Fluffy')
    return adapter.destroy()
  })

  test('The createRecord() method persists a payload', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = Cat.create({ name: 'Jeffrey' })
    await Cat.adapter.createRecord(Cat, cat.toJSON())
    const cats = await Cat.adapter.all(Cat)
    expect(cats[cats.length - 1].name).toBe('Jeffrey')
    return Cat.adapter.destroy()
  })

  test('The updateRecord() method persists a payload', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.adapter.updateRecord(Cat, 1, { name: 'Jeffrey' })
    const cat = await Cat.adapter.oneById(Cat, 1)
    expect(cat.name).toBe('Jeffrey')
    return Cat.adapter.destroy()
  })

  test('The one() method returns a single record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.adapter.one(Cat, { name: 'Rt Hon. Douglas Meow' })
    expect(cat.name).toBe('Rt Hon. Douglas Meow')
    return Cat.adapter.destroy()
  })

  test('The oneById() method returns a single record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.adapter.oneById(Cat, 1)
    expect(cat.name).toBe('Fluffy')
    return Cat.adapter.destroy()
  })

  test('The oneBySql() method returns a single record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.adapter.oneBySql(
      Cat,
      'SELECT * from cat WHERE name = ?',
      ['Fluffy']
    )
    expect(cat.name).toBe('Fluffy')
    return Cat.adapter.destroy()
  })

  test('The some() method returns a single record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.adapter.some(Cat, { name: 'Rt Hon. Douglas Meow' })
    expect(cat.length).toBe(1)
    expect(cat[0].name).toBe('Rt Hon. Douglas Meow')
    return Cat.adapter.destroy()
  })

  test('The someBySql() method returns multiple records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cats = await Cat.adapter.someBySql(Cat, 'SELECT * from cat')
    expect(cats.length).toBe(2)
    expect(cats[0].name).toBe('Fluffy')
    return Cat.adapter.destroy()
  })

  test('The deleteRecord() method', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.adapter.deleteRecord(Cat, 1)
    const cats = await Cat.adapter.all(Cat)
    expect(cats.length).toBe(1)
    return Cat.adapter.destroy()
  })
})
