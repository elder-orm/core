import { Model, type } from '../../../../src'

export default class Cat extends Model {
  @type('name') name: string
  @type('color') color: string
  @type('species') species: string
}
