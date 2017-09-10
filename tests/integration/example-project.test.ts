import orm from '../../example/orm'
const { cat: Cat } = orm.models

describe('example project', () => {
  test('setup works', async () => {
    const cats = await Cat.all()
    expect(cats[0]).toBeInstanceOf(Cat)
    return orm.destroy()
  })
})
