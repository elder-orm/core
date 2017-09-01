import Elder, {
  StringType,
  NumberType,
  PostgresAdapter,
  Serializer,
  Model,
  type,
  Collection
} from '../../src'
import * as Knex from 'knex'
import { development } from '../../knexfile'

import config from '../config'
const adapterConfig = config.adapters.default

beforeEach(async () => {
  const knex: Knex = Knex(development)
  await knex.seed.run(development.migrations)
  return knex.destroy()
})

function setupModel(Ctor: typeof Model) {
  const adapter = PostgresAdapter.create(adapterConfig)
  const serializer = Serializer.create()
  Ctor.setup(
    { string: new StringType(), number: new NumberType() },
    { default: adapter },
    { default: serializer }
  )
}

describe('Working with models', () => {
  test('Saving a new record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = Cat.create({ name: 'Tabitha' })
    expect(cat.id).toBeFalsy()
    await cat.save()
    expect(cat.id).toBeTruthy()
    return Cat.adapter.destroy()
  })

  test('Updating a record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.oneById(1)
    if (cat === null) throw new Error('Unable to find cat with id 1')
    cat.name = 'Moonshine McMuffin'
    await cat.save()
    const cat2 = await Cat.one({ name: 'Moonshine McMuffin' })
    if (cat2 === null) throw new Error('Unable to find cat Moonshine McMuffin')
    expect(cat2.id).toBe(1)
    return Cat.adapter.destroy()
  })

  test('Fetching all records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cats = await Cat.all()
    expect(cats).toBeInstanceOf(Collection)
    expect(cats[0]).toBeInstanceOf(Cat)
    expect(cats.length).toBe(2)
    return Cat.adapter.destroy()
  })

  test('idField:overwrite', async () => {
    class Cat extends Model {
      static idField = 'age'
      @type('number') age: number
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.oneById(12)
    if (cat === null) throw new Error('Unable to find cat with age 12')
    expect(cat.name).toBe('Fluffy')
    return Cat.adapter.destroy()
  })

  test('Deleting a record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.oneById(1)
    if (cat === null) throw new Error('Unable to find cat with id 1')
    await cat.del()
    const cat2 = await Cat.oneById(1)
    expect(cat2).toBe(null)
    return Cat.adapter.destroy()
  })

  test('Deleting a record where record has not yet been saved', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.create({ name: 'Mr Timms' })
    if (cat === null) throw new Error('Unable to find cat with id 1')
    try {
      await cat.del()
    } catch (e) {
      return Cat.adapter.destroy()
    }
    throw new Error('cat.del() should have thrown but did not')
  })
})
