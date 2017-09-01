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

  test('Performing a bulk delete of all records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const num = await Cat.deleteAll()
    const cats = await Cat.all()
    expect(num).toBe(2)
    expect(cats.length).toBe(0)
    return Cat.adapter.destroy()
  })

  test('Performing a truncation of all records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.truncate()
    const cats = await Cat.all()
    expect(cats.length).toBe(0)
    return Cat.adapter.destroy()
  })

  test('Performing a bulk delete of some records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.deleteSome({ name: 'Fluffy' })
    const cat = await Cat.one({ name: 'Fluffy' })
    expect(cat).toBe(null)
    return Cat.adapter.destroy()
  })

  test('Performing a bulk delete of some records, bad params throws error', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    try {
      await Cat.deleteSome({ age: 13 })
    } catch (e) {
      return Cat.adapter.destroy()
    }
    throw new Error('cat.del() should have thrown but did not')
  })

  test('Performing a delete of one record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.deleteOne({ name: 'Fluffy' })
    const cat = await Cat.one({ name: 'Fluffy' })
    expect(cat).toBe(null)
    return Cat.adapter.destroy()
  })

  test('Performing a delete of one record by id', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.deleteOneById(1)
    const cat = await Cat.one({ name: 'Fluffy' })
    expect(cat).toBe(null)
    return Cat.adapter.destroy()
  })

  test('Performing a count of records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const count = await Cat.countAll()
    expect(count).toBe(2)
    return Cat.adapter.destroy()
  })

  test('Performing a filtered count of records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const count = await Cat.countSome({ name: 'Fluffy' })
    expect(count).toBe(1)
    return Cat.adapter.destroy()
  })

  test('Performing a bulk update of all records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.updateAll({ name: 'Wiffle' })
    const num = await Cat.countSome({ name: 'Wiffle' })
    expect(num).toBe(2)
    return Cat.adapter.destroy()
  })

  test('Performing a bulk update of some records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.updateSome({ name: 'Fluffy' }, { name: 'James Turner' })
    const num = await Cat.countSome({ name: 'James Turner' })
    expect(num).toBe(1)
    return Cat.adapter.destroy()
  })

  test('Performing an update of a single record by id', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.updateOneById(1, { name: 'James Turner' })
    const num = await Cat.countSome({ name: 'James Turner' })
    expect(num).toBe(1)
    return Cat.adapter.destroy()
  })

  test('Performing an update of a single record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    await Cat.updateOne({ name: 'Fluffy' }, { name: 'James Turner' })
    const num = await Cat.countSome({ name: 'James Turner' })
    expect(num).toBe(1)
    return Cat.adapter.destroy()
  })

  test('Statically create a single record', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cat = await Cat.createOne({ name: 'Boots McWhitestripes' })
    expect(cat.id).toBeTruthy()
    expect(cat.name).toBe('Boots McWhitestripes')
    return Cat.adapter.destroy()
  })

  test('Statically create a single record: defaults used', async () => {
    class Cat extends Model {
      @type('string', { default: 'Toffee' })
      name: string
    }
    setupModel(Cat)
    const cat = await Cat.createOne({})
    expect(cat.id).toBeTruthy()
    expect(cat.name).toBe('Toffee')
    return Cat.adapter.destroy()
  })

  test('Statically create multiple records', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    setupModel(Cat)
    const cats = await Cat.createSome([
      { name: 'Boots McWhitestripes' },
      { name: "Patches O'Hoolihan" }
    ])
    expect(cats).toBe(2)
    return Cat.adapter.destroy()
  })

  test('Statically create multiple records: defaults used', async () => {
    class Cat extends Model {
      @type('string', { default: 'Colonel McFluffins' })
      name: string
    }
    setupModel(Cat)
    const num = await Cat.createSome([{}, { name: 'Dog' }])
    expect(num).toBe(2)
    const cats = await Cat.all()
    expect(cats[2].name).toBe('Colonel McFluffins')
    expect(cats[3].name).toBe('Dog')
    return Cat.adapter.destroy()
  })
})
