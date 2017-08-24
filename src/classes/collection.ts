export default class Collection extends Array {
  serialize() {
    const arr: any[] = []
    this.forEach(item => {
      arr.push(item.serialize())
    })
    return arr
  }
}
