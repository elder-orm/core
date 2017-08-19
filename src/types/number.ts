import Type from '../classes/type'

export default class NumberType extends Type {
  modify(value: number | string) {
    return Number(value)
  }

  store(value: number): string {
    return String(value)
  }

  retrieve(value: string): number {
    return Number(value)
  }
}
