import Elder, {
  StringType,
  PostgresAdapter,
  Serializer,
  Model,
  type
} from '../../src'
import * as Knex from 'knex'
import * as knexConfig from '../../knexfile'

import config from '../config'
const adapterConfig = config.adapters.default

const knex = Knex(knexConfig.development)

beforeEach(async () => {
  await knex('cat').truncate()
  await knex.migrate.latest(knexConfig.development.migrations)
  return knex.seed.run(knexConfig.development.migrations)
})

afterAll(() => {
  knex.destroy()
})

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
    const adapter = PostgresAdapter.create(adapterConfig)
    const serializer = Serializer.create()
    Model.setup(
      { string: new StringType() },
      { default: adapter },
      { default: serializer }
    )
    const cat = Cat.create({ name: 'Jeffrey' })
    await adapter.createRecord(Cat, cat.toJSON())
    const cats = await adapter.all(Cat)
    expect(cats[cats.length - 1].name).toBe('Jeffrey')
    return adapter.destroy()
  })

  test('The updateRecord() method persists a payload', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    const adapter = PostgresAdapter.create(adapterConfig)
    const serializer = Serializer.create()
    Model.setup(
      { string: new StringType() },
      { default: adapter },
      { default: serializer }
    )
    await adapter.updateRecord(Cat, 1, { name: 'Jeffrey' })
    const cat = await adapter.oneById(Cat, 1)
    expect(cat.name).toBe('Jeffrey')
    return adapter.destroy()
  })
})
