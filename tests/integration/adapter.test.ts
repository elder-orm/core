import Elder, { PostgresAdapter, Model, type } from '../../src'

import config from '../config'
const adapterConfig = config.adapters.default

class CatModel extends Model {
  @type('string') name: string
}

describe('Adapter', () => {
  test('check connection works', async () => {
    const adapter = PostgresAdapter.create(adapterConfig)
    await adapter.checkConnection()
    return adapter.destroy()
  })

  test('check connection throws', async () => {
    const adapter = PostgresAdapter.create({ database: 'doesnotexist' })
    try {
      await adapter.checkConnection()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
    }
    return adapter.destroy()
  })

  test('connection teardown', async () => {
    const adapter = PostgresAdapter.create(adapterConfig)
    return adapter.destroy()
  })

  test('check basic functionality', async () => {
    const adapter = PostgresAdapter.create(adapterConfig)
    const cats = await adapter.all(CatModel)

    expect(cats[0].name).toBe('Fluffy')
    return adapter.destroy()
  })
})
