import Elder, { PostgresAdapter, Model, type } from '../../src'

const config = { database: 'ash' }
class CatModel extends Model {
  @type('string') name: string
}

describe('Adapter', () => {
  test('check connection works', async () => {
    const adapter = PostgresAdapter.create(config)
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
    const adapter = PostgresAdapter.create(config)
    return adapter.destroy()
  })

  test('check basic functionality', async () => {
    const adapter = PostgresAdapter.create(config)
    const cats = await adapter.all(CatModel)

    expect(cats[0].name).toBe('fluffy')
    return adapter.destroy()
  })
})
