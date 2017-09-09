import Adapter from './adapter'
import Serializer from './serializer'
import Type from './type'
import Base from './base'
import Collection from './collection'
import { pluralize, singularize, dasherize, underscore } from 'inflection'

const state = new WeakMap()

export default class Model extends Base {
  static idField: string = 'id'
  static adapter: Adapter
  static serializers: serializers
  static meta: modelMeta = {
    attributeDefinition: {},
    types: {},
    relationships: {}
  }
  static _tableName: string
  static _modelName: string
  static _plural: string
  id: number

  constructor(props: { [prop: string]: any } = {}) {
    super()
    state.set(this, {})
    if (Reflect.ownKeys(props).length) {
      this.populate(props)
    }
  }

  static hydrate<T extends typeof Model>(
    this: T,
    props: props
  ): T['prototype'] {
    return new this(this.runTypeHooks(props, 'retrieve'))
  }

  static runTypeHook(key: any, value: any, hook: typeHook): any {
    const type: Type = this.meta.types[key]
    const options = this.meta.attributeDefinition[key]
    switch (hook) {
      case 'access':
        return type.access(value, options)
      case 'modify':
        return type.modify(value, options)
      case 'retrieve':
        return type.retrieve(value, options)
      case 'store':
        return type.store(value, options)
      case 'validate':
        return type.validate(value, options)
    }
  }

  static runTypeHooks(props: props, hook: typeHook): props {
    const processed: props = {}
    for (const attr of Reflect.ownKeys(this.meta.types)) {
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
    const Ctor = this
    Object.keys(this.meta.attributeDefinition).forEach(attr => {
      let typeName = this.meta.attributeDefinition[attr].type
      if (types[`${this.modelName}:${typeName}`]) {
        typeName = `${this.modelName}:${typeName}`
      }
      this.meta.types[attr] = types[typeName]
      Reflect.defineProperty(this.prototype, attr, {
        get() {
          if (
            typeof state.get(this)[attr] === 'undefined' ||
            state.get(this)[attr] === null
          ) {
            return null
          }
          return Ctor.runTypeHook(attr, state.get(this)[attr], 'access')
        },
        set(value) {
          state.get(this)[attr] = Ctor.runTypeHook(attr, value, 'modify')
          return true
        }
      })
    })
  }

  static defineId() {
    const Ctor = this
    Reflect.defineProperty(this.prototype, Ctor.idField, {
      get() {
        const that: any = this
        if (
          typeof that.state[Ctor.idField] === 'undefined' ||
          that.state[Ctor.idField] === null
        ) {
          return null
        }
        return Ctor.runTypeHook(
          Ctor.idField,
          that.state[Ctor.idField],
          'access'
        )
      },
      set(value) {
        const that: any = this
        that.state[Ctor.idField] = Ctor.runTypeHook(
          Ctor.idField,
          value,
          'modify'
        )
        return true
      }
    })
  }

  static setup(
    types: { [name: string]: Type },
    adapters: { default: Adapter; [name: string]: Adapter },
    serializers: { default: Serializer; [name: string]: Serializer }
  ) {
    let needsIdDefinition = false
    if (!this.meta.attributeDefinition[this.idField]) {
      this.meta.attributeDefinition[this.idField] = { type: 'number' }
      needsIdDefinition = true
    }
    this.attachAdapters(adapters)
    this.attachSerializers(serializers)
    this.attachTypes(types)
    if (needsIdDefinition) {
      this.defineId()
    }
  }

  static get plural(): string {
    if (this._plural) return this._plural
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return pluralize(nameDasherized)
  }

  static set plural(name: string) {
    this._plural = name
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
    if (this._modelName) return this._modelName
    const nameWithoutModel = this.name.replace('Model', '').toLowerCase()
    const nameUnderscored = underscore(nameWithoutModel)
    const nameDasherized = dasherize(nameUnderscored)
    return singularize(nameDasherized)
  }

  static set modelName(name: string) {
    this._modelName = name
  }

  static async one<T extends typeof Model>(
    this: T,
    where: where,
    options?: optsSingle
  ): Promise<T['prototype'] | null> {
    const result = await this.adapter.one(this, where, options)
    if (!result) return null
    return this.hydrate(result)
  }

  static async oneById<T extends typeof Model>(
    this: T,
    id: number,
    options?: optsSingle
  ): Promise<T['prototype'] | null> {
    const result = await this.adapter.oneById(this, id, options)
    if (!result) return null
    const instance = this.hydrate(result)
    return instance
  }

  static async oneBySql<T extends typeof Model>(
    this: T,
    sql: string,
    params?: string[] | number[],
    options?: optsSingle
  ): Promise<T['prototype'] | null> {
    const result = await this.adapter.oneBySql(this, sql, params, options)
    if (!result) return null
    return this.hydrate(result)
  }

  static async some<T extends typeof Model>(
    where: where,
    options?: optsMultiple
  ): Promise<Collection> {
    const results = await this.adapter.some(this, where, options)
    const instances: T[] = results.map(this.hydrate.bind(this))
    return new Collection(...instances)
  }

  static async someBySql<T extends typeof Model>(
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

  static async all<T extends typeof Model>(
    options?: optsMultiple
  ): Promise<Collection> {
    const results: any[] = await this.adapter.all(this, options)
    const instances: T[] = results.map(this.hydrate.bind(this))
    return new Collection(...instances)
  }

  static async createOne<T extends typeof Model>(
    this: T,
    props: props
  ): Promise<T['prototype']> {
    for (const prop of Reflect.ownKeys(props)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
        Invalid key '${prop}' defined on 'props' given to 'Model.createOne'.
        Included properties must be defined on model class
        Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
        Instead got '${Reflect.ownKeys(props).join("', '")}'
        `)
      }
    }
    const defaults: props = {}
    for (const [key, value] of Object.entries(this.meta.attributeDefinition)) {
      if (value && value.default) {
        defaults[key] = value.default
      }
    }
    const data = Object.assign({}, defaults, props)
    const result = await this.adapter.createRecord(this, data)
    return this.hydrate(result)
  }

  static async createSome(records: props[]): Promise<number> {
    for (let [index, props] of records.entries()) {
      for (const prop of Reflect.ownKeys(props)) {
        if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
          throw new Error(`
            Invalid key '${prop}' defined for record at index '${index}' given to 'Model.createSome'.
              Included properties must be defined on model class
              Valid properties '${Reflect.ownKeys(this.meta.types).join(
                "', '"
              )}'
              Instead got '${Reflect.ownKeys(props).join("', '")}'
          `)
        }
      }
    }
    return this.adapter.createSome(
      this,
      records.map(record => {
        const defaults: props = {}
        for (const [key, value] of Object.entries(
          this.meta.attributeDefinition
        )) {
          if (value && value.default) {
            defaults[key] = value.default
          }
        }
        return Object.assign({}, defaults, record)
      })
    )
  }

  static deleteAll(): Promise<number> {
    return this.adapter.deleteAll(this)
  }

  static deleteSome(where: props): Promise<number> {
    for (const prop of Reflect.ownKeys(where)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'where' given to 'Model.deleteSome'.
            Included properties must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(where).join("', '")}'
        `)
      }
    }
    return this.adapter.deleteSome(this, where)
  }

  static deleteOne(where: props): Promise<number> {
    for (const prop of Reflect.ownKeys(where)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'where' given to 'Model.deleteOne'.
            Included properties must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(where).join("', '")}'
        `)
      }
    }
    return this.adapter.deleteOne(this, where)
  }

  static deleteOneById(id: number): Promise<number> {
    return this.adapter.deleteOneById(this, id)
  }

  static updateAll(props: props): Promise<number> {
    for (const prop of Reflect.ownKeys(props)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'props' given to 'Model.updateAll'.
            Included properties must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(props).join("', '")}'
        `)
      }
    }
    return this.adapter.updateAll(this, props)
  }

  static updateSome(where: props, props: props): Promise<number> {
    for (const prop of Reflect.ownKeys(where)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'where' given to 'Model.updateSome'.
            Included properties must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(where).join("', '")}'
        `)
      }
    }
    for (const prop of Reflect.ownKeys(props)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'props' given to 'Model.updateSome'.
            Included properties to update must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(props).join("', '")}'
        `)
      }
    }
    return this.adapter.updateSome(this, where, props)
  }

  static updateOneById(id: number, props: props): Promise<number> {
    for (const prop of Reflect.ownKeys(props)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'props' given to 'Model.updateOneById'.
            Included properties must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(props).join("', '")}'
        `)
      }
    }
    return this.adapter.updateOneById(this, id, props)
  }

  static updateOne(where: props, props: props): Promise<number> {
    for (const prop of Reflect.ownKeys(where)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'where' given to 'Model.updateOne'.
            Included properties must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(where).join("', '")}'
        `)
      }
    }
    for (const prop of Reflect.ownKeys(props)) {
      if (!Reflect.ownKeys(this.meta.types).includes(prop)) {
        throw new Error(`
          Invalid key '${prop}' defined on 'props' given to 'Model.updateOne'.
            Included properties to update must be defined on model class
            Valid properties '${Reflect.ownKeys(this.meta.types).join("', '")}'
            Instead got '${Reflect.ownKeys(props).join("', '")}'
        `)
      }
    }
    return this.adapter.updateOne(this, where, props)
  }

  static truncate(): Promise<void> {
    return this.adapter.truncate(this)
  }

  static countAll(): Promise<number> {
    return this.adapter.countAll(this)
  }

  static countSome(where: props): Promise<number> {
    return this.adapter.countSome(this, where)
  }

  rehydrate(props: props): void {
    this.populate(this.ctor.runTypeHooks(props, 'retrieve'))
  }

  dehydrate(): props {
    return this.ctor.runTypeHooks(
      this.ctor.runTypeHooks(state.get(this), 'access'),
      'store'
    )
  }

  populate(props: props): void {
    state.set(this, this.ctor.runTypeHooks(props, 'modify'))
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
    const { types } = this.ctor.meta
    for (const [property] of Object.entries(types)) {
      if (types[property] && this[property]) {
        json[property] = this[property]
      }
    }
    return json
  }

  async save(): Promise<void> {
    const Ctor = this.constructor as typeof Model
    let result
    if (!state.get(this).id) {
      result = await Ctor.adapter.createRecord(Ctor, this.dehydrate())
    } else {
      const id = state.get(this)[this.ctor.idField]
      result = await Ctor.adapter.updateRecord(Ctor, id, this.dehydrate())
    }
    this.rehydrate(result)
  }

  async del(): Promise<void> {
    const Ctor = this.constructor as typeof Model
    if (!state.get(this)[Ctor.idField]) {
      throw new Error(
        `Unable to delete record for model '${Ctor.name}'.
          Expected '${Ctor.idField}' field to contain a value but was empty`
      )
    }
    const id = state.get(this)[this.ctor.idField]
    return Ctor.adapter.deleteRecord(Ctor, id)
  }

  toString() {
    let stateStr: string = '{'
    const keyValueStrings: string[] = []
    for (const [key, value] of Object.entries(state.get(this))) {
      keyValueStrings.push(`${key}: '${value}'`)
    }
    stateStr += keyValueStrings.join(', ')
    stateStr += '}'
    return `${this.ctor.name} ${stateStr}`
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
  attributeDefinition: {
    [attrName: string]: {
      type: string
      default?: string
      [key: string]: any
    }
  }
  types: { [attrName: string]: Type }
  relationships: { [relName: string]: relationship }
}

export type props = {
  [name: string]: any
}

export type typeHook = 'access' | 'modify' | 'retrieve' | 'store' | 'validate'
