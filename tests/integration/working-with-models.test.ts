import Elder, {
  StringType,
  NumberType,
  PostgresAdapter,
  Serializer,
  Model,
  type
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
    await cat.save()
    // expect(cat.id).toBeTruthy()
    return Cat.adapter.destroy()
  })
})
