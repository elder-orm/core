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

beforeEach(async () => {
  const knex: Knex = Knex(development)
  await knex.seed.run(development.migrations)
  return knex.destroy()
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
      @type('date') createdAt: any
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.createdAt = '2017-04-28T20:17:25.601Z'
    expect(cat.createdAt.toISOString()).toBe('2017-04-28T20:17:25.601Z')
    return orm.destroy()
  })

  test('Saving a DateType property', async () => {
    class Cat extends Model {
      @type('string') name: string
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

  test('Accessing a BooleanType property', async () => {
    class Cat extends Model {
      @type('boolean') isActive: boolean
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    expect(cat.isActive).toBe(true)
    return orm.destroy()
  })

  test('Modifying a BooleanType property using a boolean', async () => {
    class Cat extends Model {
      @type('boolean') isActive: boolean
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.isActive = false
    expect(cat.isActive).toBe(false)
    return orm.destroy()
  })

  test('Modifying a BooleanType property using a string', async () => {
    class Cat extends Model {
      @type('boolean') isActive: any
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.isActive = 'f'
    expect(cat.isActive).toBe(false)
    return orm.destroy()
  })

  test('Saving a BooleanType property', async () => {
    class Cat extends Model {
      @type('string') name: string
      @type('boolean') isActive: boolean
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    await Cat.adapter.createRecord(Cat, {
      name: 'The very active Mr Hollingsworth',
      isActive: false
    })
    const cat = await Cat.one({ name: 'The very active Mr Hollingsworth' })
    expect(cat.isActive).toBe(false)
    return orm.destroy()
  })

  test('Accessing a NumberType property', async () => {
    class Cat extends Model {
      @type('number') age: number
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    expect(cat.age).toBe(12)
    return orm.destroy()
  })

  test('Modifying a NumberType property using a number', async () => {
    class Cat extends Model {
      @type('number') age: number
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.age = 13
    expect(cat.age).toBe(13)
    return orm.destroy()
  })

  test('Modifying a NumberType property using a string', async () => {
    class Cat extends Model {
      @type('number') age: any
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.age = '13'
    expect(cat.age).toBe(13)
    return orm.destroy()
  })

  test('Saving a NumberType property', async () => {
    class Cat extends Model {
      @type('string') name: string
      @type('number') age: number
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    await Cat.adapter.createRecord(Cat, {
      name: 'Kitten Winters',
      age: 1
    })
    const cat = await Cat.one({ name: 'Kitten Winters' })
    expect(cat.age).toBe(1)
    return orm.destroy()
  })

  test('Accessing a StringType property', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    expect(cat.name).toBe('Fluffy')
    return orm.destroy()
  })

  test('Modifying a StringType property using a number', async () => {
    class Cat extends Model {
      @type('string') name: any
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.name = 13
    expect(cat.name).toBe('13')
    return orm.destroy()
  })

  test('Modifying a StringType property using an object', async () => {
    class Cat extends Model {
      @type('string') name: any
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.name = {
      toString() {
        return 'Dog'
      }
    }
    expect(cat.name).toBe('Dog')
    return orm.destroy()
  })

  test('Modifying a StringType property using a string', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    const cat = await Cat.oneById(1)
    cat.name = 'James McCat'
    expect(cat.name).toBe('James McCat')
    return orm.destroy()
  })

  test('Saving a StringType property', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    const orm = Elder.create({ config, models: { cat: Cat } })
    await Cat.adapter.createRecord(Cat, {
      name: 'Astrid Pono'
    })
    const cat = await Cat.one({ name: 'Astrid Pono' })
    expect(cat.name).toBe('Astrid Pono')
    return orm.destroy()
  })
})
