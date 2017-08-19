import Type from '../classes/type'

export default class DateType extends Type {
  modify(value: Date) {
    return value
  }

  store(value: Date): string {
    return value.toISOString()
  }

  retrieve(value: string): Date {
    return new Date(value)
  }
}
