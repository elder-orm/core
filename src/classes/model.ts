import Adapter from './adapter'
import Serializer from './serializer'
import Type from './type'
import Base from './base'
import Collection from './collection'
import { pluralize, singularize, dasherize, underscore } from 'inflection'

const clone = (obj: any): any => JSON.parse(JSON.stringify(obj))

export default class Model extends Base {
  static idField: string = 'id'
  static adapter: Adapter
  static serializers: serializers
  static meta: modelMeta = {
    attributeDefinition: {},
    attributes: {},
    relationships: {}
  }

  constructor(props: { [prop: string]: any } = {}) {
    super()
    const Ctor = this.constructor as typeof Model
    const that: { [key: string]: any } = this

    for (const [key, value] of Object.entries(props)) {
      if (!Ctor.meta.attributes[key]) continue
      const type = Ctor.meta.attributes[key]
      that[key] = type.retrieve(value)
    }

    return new Proxy(this, {
      get(target, name): any {
        if (!Reflect.ownKeys(Ctor.meta.attributes).includes(name)) {
          return that[name]
        }

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

  static createCollection(Ctor: typeof Model, arr: any[]): Collection {
    const collection = new Collection()
    for (const item of arr) {
      collection.push(Ctor.create(clone(item)))
    }
    return collection
  }

  static attachAdapters(adapters: {
    default: Adapter
    [name: string]: Adapter
  }) {
    this.adapter = adapters.default
    for (let [key, value] of Object.entries(adapters)) {
      if (key === 'default') {
        continue
      }
      if (key === this.modelName) {
        this.adapter = value
      }
    }
  }

  static attachSerializers(serializers: {
    default: Serializer
    [name: string]: Serializer
  }) {
    this.serializers = serializers
  }

  static attachTypes(types: { [name: string]: Type }) {
    Object.keys(this.meta.attributeDefinition).forEach(attr => {
      let typeName = this.meta.attributeDefinition[attr]
      if (types[`${this.modelName}:${typeName}`]) {
        typeName = `${this.modelName}:${typeName}`
      }
      Model.meta.attributes[attr] = types[typeName]
    })
  }

  static setup(
    types: { [name: string]: Type },
    adapters: { default: Adapter; [name: string]: Adapter },
    serializers: { default: Serializer; [name: string]: Serializer }
  ) {
    if (!this.meta.attributeDefinition[this.idField]) {
      this.meta.attributeDefinition[this.idField] = 'number'
    }
    this.attachAdapters(adapters)
    this.attachSerializers(serializers)
    this.attachTypes(types)
  }

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
    return this.createCollection(this, results)
  }

  static async someBySql(
    sql: string,
    params?: string[] | number[],
    options?: optsMultiple
  ) {
    const results = await this.adapter.someBySql(this, sql, params, options)
    return this.createCollection(this, results)
  }

  static async all(options?: optsMultiple) {
    const results = await this.adapter.all(this, options)
    return this.createCollection(this, results)
  }

  get adapter(): Adapter {
    const Ctor = this.constructor as typeof Model
    return Ctor.adapter
  }

  get serializers(): serializers {
    const Ctor = this.constructor as typeof Model
    return Ctor.serializers
  }

  serialize(name?: string): any {
    if (!name) name = 'default'
    const serializer = this.serializers[name]
    return serializer.serialize(this.constructor as typeof Model, this.toJSON())
  }

  validate(): Promise<Boolean> {
    return Promise.resolve(true)
  }

  get errors(): Error[] {
    return [new Error()]
  }

  get ctor() {
    return this.constructor as typeof Model
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
}

export type serializers = {
  default: Serializer
  [propName: string]: Serializer
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

export type where = { [key: string]: any } | any[]

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
