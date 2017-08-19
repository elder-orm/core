import Type from '../classes/type'

export default class BooleanType extends Type {
  modify(value: boolean) {
    return value
  }

  store(value: boolean): string {
    return String(value)
  }

  retrieve(value: string): boolean {
    return Boolean(value)
  }
}
