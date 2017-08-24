import Elder, {
  Model,
  StringType,
  type,
  Adapter,
  PostgresAdapter,
  Collection
} from '../../src'

import config from '../config'

describe('Elder', () => {
  test('model setup', async () => {
    class CatModel extends Model {
      @type('string') name: string
    }
    const orm = Elder.create({
      config,
      models: { cat: CatModel }
    })
    const cats = await CatModel.all()
    expect(cats).toBeInstanceOf(Collection)
    expect(cats[0]).toBeInstanceOf(CatModel)
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })

  test('model with custom type', async () => {
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

  test('model with custom scoped type', async () => {
    class CatModel extends Model {
      @type('name') name: string
    }
    class CatName extends StringType {}
    const orm = Elder.create({
      config,
      models: { cat: CatModel },
      types: { 'cat:name': CatName }
    })
    const cats = await CatModel.all()
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })

  test('model with custom adapter', async () => {
    class CatModel extends Model {
      @type('string') name: string
    }
    class FakeAdapter extends Adapter {
      all(): any {
        // noop
      }
    }
    const orm = Elder.create({
      config: config,
      models: { cat: CatModel },
      adapters: { default: FakeAdapter, cat: PostgresAdapter }
    })
    const cats = await CatModel.all()
    expect(cats[0].name).toBe('Fluffy')
    return orm.destroy()
  })
})
