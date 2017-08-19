import Adapter from './adapter'
import Serializer from './serializer'
import Type from './type'
import Base from './base'
import { pluralize, singularize, dasherize, underscore } from 'inflection'

export type Serializers = {
  default: Serializer
  [propName: string]: Serializer
}

export interface ModelCtor {
  name: string
}

export class Collection extends Array {
  serialize() {
    return this
  }
}

export type optsMultiple = {
  include?: string | string[]
  sort?: string
  fields?: string[]
  limit?: number
  page?: number
}

export type optsSingle = {
  include?: string | string[]
  fields?: string[]
}

export type where =
  | {
      [key: string]: any
    }
  | Array<any>

export type relationship = {
  name: string
  type: 'belongsTo' | 'hasMany'
  modelTo: typeof Model
  modelFrom: typeof Model
  keyTo: string
  keyFrom: string
}

export type modelMeta = {
  attributeDefinition: { [attrName: string]: string }
  attributes: { [attrName: string]: Type }
  relationships: { [relName: string]: relationship }
}

const clone = (obj: any): any => JSON.parse(JSON.stringify(obj))
const first = (arr: any[]): any => arr[0] || null
const createCollection = (Ctor: typeof Model, arr: any[]): Collection => {
  const collection = new Collection()
  for (const item of arr) {
    collection.push(Ctor.create(clone(item)))
  }
  return collection
}

export default class Model extends Base {
  constructor(props: { [prop: string]: any } = {}) {
    super()
    const Ctor = <typeof Model>this.constructor
    const that: { [key: string]: any } = this

    for (const [key, value] of Object.entries(props)) {
      if (!Ctor.meta.attributes[key]) continue
      const type = Ctor.meta.attributes[key]
      that[key] = type.retrieve(value)
    }

    return new Proxy(this, {
      get(target, name): any {
        if (!Ctor.meta.attributes[name]) return that[name]
        const type = Ctor.meta.attributes[name]
        return type.access(that[name])
      },
      set(target, name, value) {
        if (Ctor.meta.attributes[name]) {
          const type = Ctor.meta.attributes[name]
          that[name] = type.modify(value)
        } else {
          that[name] = value
        }
        return true
      }
    })
  }

  static adapter: Adapter = Adapter.create()
  static serializers: Serializers
  static meta: modelMeta = {
    attributeDefinition: {},
    attributes: {},
    relationships: {}
  }

  static idField: string = 'id'

  static get plural(): string {
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return pluralize(nameDasherized)
  }

  static get tableName(): string {
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    return singularize(nameUnderscored)
  }

  static get modelName(): string {
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return singularize(nameDasherized)
  }

  get adapter(): Adapter {
    const Ctor = <typeof Model>this.constructor
    return Ctor.adapter
  }

  get serializers(): Serializers {
    const Ctor = <typeof Model>this.constructor
    return Ctor.serializers
  }

  serialize(name?: string): any {
    if (!name) name = 'default'
    const serializer = this.serializers[name]
    return serializer.serialize(<typeof Model>this.constructor, this.toJSON())
  }

  validate(): Promise<Boolean> {
    return Promise.resolve(true)
  }

  get errors(): Error[] {
    return [new Error()]
  }

  get ctor() {
    return <typeof Model>this.constructor
  }

  toJSON(this: { [key: string]: any }): { [key: string]: any } {
    const json: { [key: string]: any } = {}
    const { attributes } = this.ctor.meta
    for (const [property, type] of Object.entries(attributes)) {
      if (attributes[property]) {
        json[property] = type.access(this[property])
      }
    }
    return json
  }

  save(): Promise<any> {
    return Promise.resolve()
  }

  static async one(where: where, options?: optsSingle) {
    const result = await this.adapter.one(this, where, options)
    return this.create(clone(result))
  }

  static async oneById(id: number, options?: optsSingle) {
    const result = await this.adapter.oneById(this, id, options)
    return this.create(clone(result))
  }

  static async oneBySql(
    sql: string,
    params?: string[] | number[],
    options?: optsSingle
  ) {
    const result = await this.adapter.oneBySql(this, sql, params, options)
    return this.create(clone(result))
  }

  static async some(where: where, options?: optsMultiple) {
    const results = await this.adapter.some(this, where, options)
    return createCollection(this, results)
  }

  static async someBySql(
    sql: string,
    params?: string[] | number[],
    options?: optsMultiple
  ) {
    const results = await this.adapter.someBySql(this, sql, params, options)
    return createCollection(this, results)
  }

  static async all(options?: optsMultiple) {
    const results = await this.adapter.all(this, options)
    return createCollection(this, results)
  }
}
