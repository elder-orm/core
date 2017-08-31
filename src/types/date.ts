import Type from '../classes/type'
import TypeError from '../classes/errors/type'

export default class DateType extends Type {
  modify(value: Date | string): Date {
    if (typeof value === 'string') {
      const date: Date = new Date(value)
      if (date.toString() === 'Invalid Date') {
        throw new TypeError(`
          Unparsable date string given to '${this.constructor.name}'.
            Expected string to be in the ISO 8601 Extended Format but
            instead got '${value}'
        `)
      }
      return date
    }
    return value
  }

  store(value: Date): string {
    return value.toISOString()
  }

  retrieve(value: string): Date {
    return new Date(value)
  }
}
