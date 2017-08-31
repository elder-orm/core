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
  static _tableName: string
  state: props = {}

  constructor(props: { [prop: string]: any } = {}) {
    super()
    const Ctor = this.constructor as typeof Model
    const that: { [key: string]: any } = this

    if (Reflect.ownKeys(props).length) {
      that.populate(props)
    }

    return new Proxy(this, {
      get(target, name): any {
        if (!Reflect.ownKeys(Ctor.meta.attributes).includes(name)) {
          return that[name]
        }
        if (
          typeof that.state[name] === 'undefined' ||
          that.state[name] === null
        ) {
          return null
        }
        return Ctor.runTypeHook(name, that.state[name], 'access')
      },
      set(target, name, value) {
        if (Ctor.meta.attributes[name]) {
          that.state[name] = Ctor.runTypeHook(name, value, 'modify')
        }
        that[name] = value
        return true
      }
    })
  }

  static hydrate<T extends typeof Model>(
    this: T,
    props: props
  ): T['prototype'] {
    return new this(this.runTypeHooks(props, 'retrieve'))
  }

  static runTypeHook(key: any, value: any, hook: typeHook): any {
    const type: Type = this.meta.attributes[key]
    switch (hook) {
      case 'access':
        return type.access(value)
      case 'modify':
        return type.modify(value)
      case 'retrieve':
        return type.retrieve(value)
      case 'store':
        return type.store(value)
      case 'validate':
        return type.validate(value)
    }
  }

  static runTypeHooks(props: props, hook: typeHook): props {
    const processed: props = {}
    for (const attr of Reflect.ownKeys(this.meta.attributes)) {
      if (typeof props[attr] === 'undefined' || props[attr] === null) continue
      processed[attr] = this.runTypeHook(attr, props[attr], hook)
    }
    return processed
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
      this.meta.attributes[attr] = types[typeName]
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
    if (this._tableName) return this._tableName
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    return singularize(nameUnderscored)
  }

  static set tableName(name: string) {
    this._tableName = name
  }

  static get modelName(): string {
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return singularize(nameDasherized)
  }

  static async one<T extends typeof Model>(
    this: T,
    where: where,
    options?: optsSingle
  ): Promise<T['prototype']> {
    const result = await this.adapter.one(this, where, options)
    return this.hydrate(clone(result))
  }

  static async oneById<T extends typeof Model>(
    this: T,
    id: number,
    options?: optsSingle
  ): Promise<T['prototype']> {
    const result = await this.adapter.oneById(this, id, options)
    return this.hydrate(clone(result))
  }

  static async oneBySql<T extends typeof Model>(
    this: T,
    sql: string,
    params?: string[] | number[],
    options?: optsSingle
  ): Promise<T['prototype']> {
    const result = await this.adapter.oneBySql(this, sql, params, options)
    return this.hydrate(clone(result))
  }

  static async some<T extends Model>(
    where: where,
    options?: optsMultiple
  ): Promise<Collection> {
    const results = await this.adapter.some(this, where, options)
    const instances: T[] = results.map(this.hydrate.bind(this))
    return new Collection(...instances)
  }

  static async someBySql<T extends Model>(
    sql: string,
    params?: string[] | number[],
    options?: optsMultiple
  ): Promise<Collection> {
    const results: any[] = await this.adapter.someBySql(
      this,
      sql,
      params,
      options
    )
    const instances: T[] = results.map(this.hydrate.bind(this))
    return new Collection(...instances)
  }

  static async all<T extends Model>(
    options?: optsMultiple
  ): Promise<Collection> {
    const results: any[] = await this.adapter.all(this, options)
    const instances: T[] = results.map(this.hydrate.bind(this))
    return new Collection(...instances)
  }

  rehydrate(props: props): void {
    this.populate(this.ctor.runTypeHooks(props, 'retrieve'))
  }

  dehydrate(): props {
    return this.ctor.runTypeHooks(
      this.ctor.runTypeHooks(this.state, 'access'),
      'store'
    )
  }

  populate(props: props): void {
    this.state = this.ctor.runTypeHooks(props, 'modify')
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
      if (attributes[property] && this[property]) {
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

export type props = {
  [name: string]: any
}

export type typeHook = 'access' | 'modify' | 'retrieve' | 'store' | 'validate'
