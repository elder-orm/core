import { Base } from '../../../src'

describe('extending Base', () => {
  test('create() method', () => {
    class Custom extends Base {}
    expect(Custom.create()).toBeInstanceOf(Custom)
  })
})
