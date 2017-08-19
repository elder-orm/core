export default class Base {
  static create(...args: any[]): any {
    return new this(...args)
  }
}
