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

describe('Defining models', () => {
  test('Creating a simple model', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    const orm = Elder.create({
      config,
      models: { cat: Cat }
    })
    const cats = await Cat.all()
    expect(cats).toBeInstanceOf(Collection)
    expect(cats.length).toBe(2)
    expect(cats[0]).toBeInstanceOf(Cat)
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })

  test('Creating a model with a custom type', async () => {
    class CatModel extends Model {
      @type('cat-name') name: string
    }
    class CatName extends StringType {}
    const orm = Elder.create({
      config,
      models: { cat: CatModel },
      types: { 'cat-name': CatName }
    })
    const cats = await CatModel.all()
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })

  test('Creating a model with a custom type thats scoped to the model', async () => {
    class Cat extends Model {
      @type('name') name: string
    }
    class CatName extends StringType {}
    const orm = Elder.create({
      config,
      models: { cat: Cat },
      types: { 'cat:name': CatName }
    })
    const cats = await Cat.all()
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })

  test('Creating a model with a custom adapter', async () => {
    class Cat extends Model {
      @type('string') name: string
    }
    class Dog extends Model {
      @type('string') name: string
    }
    class DefaultAdapter extends Adapter {
      all(): Promise<any> {
        return Promise.resolve([{ name: 'Fido' }])
      }
    }
    const orm = Elder.create({
      config: config,
      models: { cat: Cat, dog: Dog },
      adapters: { default: DefaultAdapter, cat: PostgresAdapter }
    })

    const cats = await Cat.all()
    const dogs = await Dog.all()

    expect(cats[0].name).toBe('Fluffy')
    expect(dogs.serialize()).toEqual([{ name: 'Fido' }])
    return orm.destroy()
  })
})
