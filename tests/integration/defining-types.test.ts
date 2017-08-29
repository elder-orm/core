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

describe('Defining types', () => {
  test('Extending the StringType to create a custom type', async () => {
    class Cat extends Model {
      @type('cat-name') name: string
    }
    const CatNameType = class extends StringType {}
    const orm = Elder.create({
      config,
      models: { cat: Cat },
      types: { 'cat-name': CatNameType }
    })
    const cats = await Cat.all()
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })

  test('Custom type with access hook implemented', async () => {
    class CatModel extends Model {
      @type('cat-name') name: string
    }
    const CatNameType = class extends StringType {
      access(value: string): string {
        return `Cat name: ${value}`
      }
    }
    const orm = Elder.create({
      config,
      models: { cat: CatModel },
      types: { 'cat-name': CatNameType }
    })
    const cats = await CatModel.all()
    expect(cats[0].name).toBe('Cat name: Fluffy')
    return orm.destroy()
  })

  test('Custom type with retrieve hook implemented', async () => {
    class CatModel extends Model {
      @type('cat-name') name: string
    }
    const CatNameType = class extends StringType {
      retrieve(value: string): string {
        return `~~meow~~(${value})~~meow~~`
      }
    }
    const orm = Elder.create({
      config,
      models: { cat: CatModel },
      types: { 'cat-name': CatNameType }
    })
    const cats = await CatModel.all()
    expect(cats[0].name).toBe('~~meow~~(Fluffy)~~meow~~')
    return orm.destroy()
  })

  test('Custom type with modify hook implemented', async () => {
    class CatModel extends Model {
      @type('cat-name') name: string
    }
    const CatNameType = class extends StringType {
      modify(value: string): string {
        return `~~paws~~(${value})~~paws~~`
      }
    }
    const orm = Elder.create({
      config,
      models: { cat: CatModel },
      types: { 'cat-name': CatNameType }
    })
    const cat = CatModel.create()
    cat.name = 'Colonel Paws'
    expect(cat.name).toBe('~~paws~~(Colonel Paws)~~paws~~')
    return orm.destroy()
  })
})
