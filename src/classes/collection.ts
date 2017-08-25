export default class Collection extends Array {
  constructor(...args: any[]) {
    super(...args)
  }

  serialize() {
    const arr: any[] = []
    this.forEach(item => {
      arr.push(item.serialize())
    })
    return arr
  }

  static create(...items: any[]) {
    return new Collection(...arguments)
  }
}
