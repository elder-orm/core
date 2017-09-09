import Type, { options } from '../classes/type'
import TypeError from '../classes/errors/type'

export default class NumberType extends Type {
  modify(value: number | string, options: options): number {
    const num = Number(value)
    if (isNaN(num)) {
      throw new TypeError(
        `Type '${this.constructor.name}' expected value being set to
        be either a number or a numeric string. Instead got '${value}'`
      )
    }
    return num
  }

  store(value: number, options: options): string {
    return String(value)
  }

  retrieve(value: string, options: options): number {
    return Number(value)
  }
}
