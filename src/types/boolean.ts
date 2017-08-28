import Type from '../classes/type'
import TypeError from '../classes/errors/type'

export default class BooleanType extends Type {
  throwTypeError(value: boolean | number | string): void {
    throw new TypeError(`
      Type '${this.constructor.name}' expected value being set to be one of:
        - A boolean value (true|false)
        - A boolean string ('true'|'false'|'TRUE'|'FALSE'|'T'|'F'|'t'|'f'|'0'|'1')
        - A binary number (0|1).
      Instead got '${value}'
    `)
  }

  modify(value: boolean | number | string): boolean | void {
    if (['true', 'TRUE', 'T', 't', '1', 1, true].includes(value)) {
      return true
    } else if (['false', 'FALSE', 'F', 'f', '0', 0, false].includes(value)) {
      return false
    } else {
      this.throwTypeError(value)
    }
  }

  store(value: boolean): string {
    return value === true ? 'TRUE' : 'FALSE'
  }

  retrieve(value: string | number | boolean): boolean | void {
    if (['true', 'TRUE', 'T', 't', '1', 1, true].includes(value)) {
      return true
    } else if (['false', 'FALSE', 'F', 'f', '0', 0, false].includes(value)) {
      return false
    } else {
      this.throwTypeError(value)
    }
  }
}
