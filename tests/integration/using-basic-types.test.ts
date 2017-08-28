import Elder, {
  Model,
  StringType,
  type,
  Adapter,
  PostgresAdapter,
  Collection
} from '../../src'

import * as Knex from 'knex'
import { development } from '../../knexfile'
import config from '../config'

const knex = Knex(development)

beforeEach(async () => {
  await knex('cat').truncate()
  await knex.migrate.latest(development.migrations)
  return knex.seed.run(development.migrations)
})

afterAll(() => {
  knex.destroy()
})

describe('Using basic types', () => {
  test('Accessing a DateType property', async () => {
    class Cat extends Model {
      @type('date') createdAt: Date
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    expect(cat.createdAt.toISOString()).toBe('2017-08-28T20:17:25.601Z')
    return orm.destroy()
  })

  test('Modifying a DateType property using a date', async () => {
    class Cat extends Model {
      @type('date') createdAt: Date
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.createdAt = new Date('2017-06-28T20:17:25.601Z')
    expect(cat.createdAt.toISOString()).toBe('2017-06-28T20:17:25.601Z')
    return orm.destroy()
  })

  test('Modifying a DateType property using a date string', async () => {
    class Cat extends Model {
      @type('date') createdAt: Date
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.createdAt = '2017-04-28T20:17:25.601Z'
    expect(cat.createdAt.toISOString()).toBe('2017-04-28T20:17:25.601Z')
    return orm.destroy()
  })

  test('Saving a DateType property', async () => {
    class Cat extends Model {
      @type('name') name: string
      @type('date') createdAt: Date
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    await Cat.adapter.createRecord(Cat, {
      name: 'My Tibbles',
      createdAt: '2017-01-28T20:17:25.601Z'
    })
    const cat2 = await Cat.one({ name: 'My Tibbles' })
    expect(cat2.createdAt.toISOString()).toBe('2017-01-28T20:17:25.601Z')
    return orm.destroy()
  })
})
