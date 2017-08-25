import Elder, { PostgresAdapter, Model, type } from '../../src'

import config from '../config'
const adapterConfig = config.adapters.default

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
})
