// export default class Base {
//   static create(...args: any[]) {
//     return new this(...args)
//   }
// }

// export interface IBase<T extends Base> {
//   new (...a: any[]): T

//   create<T extends Base>(this: IBase<T>): T
// }

export default class Base {
  static create<T extends typeof Base>(
    this: T,
    ...args: any[]
  ): T['prototype'] {
    return new this(...args)
  }
}
