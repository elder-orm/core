import Model, { serializers } from './model'
import { SerializableArray } from './util'
import Base from './base'
import Type from './type'
import { PostgresAdapter } from '../adapters'
import Adapter from './adapter'
import Serializer from './serializer'
import { StringType, NumberType, DateType, BooleanType } from '../types'

export type databaseConfig =
  | string
  | {
      database: string
      host?: string
      user?: string
      password?: string
      port?: number
    }

export type config = {
  adapters: {
    default: databaseConfig
    [name: string]: databaseConfig
  }
}

export type modelClasses = {
  [name: string]: typeof Model
}

export type typeClasses = {
  [name: string]: typeof Type
}

export type serializerClasses = {
  default: typeof Serializer
  [name: string]: typeof Serializer
}

export type adapterClasses = {
  default: typeof Adapter
  [name: string]: typeof Adapter
}

export type options = {
  config: config
  types?: typeClasses
  models: modelClasses
  adapters?: adapterClasses
  serializers?: serializerClasses
}

export type adapters = {
  default: Adapter
  [name: string]: Adapter
}

export type serializers = {
  default: Serializer
  [name: string]: Serializer
}

export type types = {
  [name: string]: Type
}

export type models = {
  [name: string]: typeof Model
}

/**
 * Merges a default adapter class with additional adapter classes
 */
function mergeAdapters(
  defaultAdapter: typeof Adapter,
  adapters?: {
    [name: string]: typeof Adapter
  }
) {
  return Object.assign({}, { default: defaultAdapter }, adapters)
}

/**
 * Merges a default serializer class with additional serializer classes
 */
function mergeSerializers(
  defaultSerializer: typeof Serializer,
  serializers?: {
    [name: string]: typeof Serializer
  }
) {
  return Object.assign({}, { default: defaultSerializer }, serializers)
}

/**
 * Merges default type classes with additional type classes
 */
function mergeTypes(types?: { [name: string]: typeof Type }) {
  return Object.assign(
    {},
    {
      string: StringType,
      number: NumberType,
      date: DateType,
      boolean: BooleanType
    },
    types
  )
}

/**
 * Iterates over given models calling each models setup method
 */
function setupModels(
  models: modelClasses,
  types: types,
  adapters: adapters,
  serializers: serializers
) {
  Object.keys(models).forEach(name => {
    const Model = models[name]
    Model.setup(types, adapters, serializers)
  })
}

/**
 * Creates and returns adapter class instances for given adapter classes
 */
function setupAdapters(
  adapters: adapterClasses,
  config: {
    default: databaseConfig
    [name: string]: databaseConfig
  }
): adapters {
  const instances: adapters = {
    default: adapters.default.create(config.default)
  }

  for (let [key, value] of Object.entries(adapters)) {
    if (key === 'default') continue
    instances[key] = value.create(config[key])
  }
  return instances
}

/**
 * Creates and returns serializer class instances for given serializer classes
 */
function setupSerializers(serializers: serializerClasses): serializers {
  const instances: serializers = {
    default: serializers.default.create()
  }

  for (let [key, value] of Object.entries(serializers)) {
    if (key === 'default') continue
    instances[key] = value.create()
  }

  return instances
}

/**
 * Creates and returns type class instances for given type classes
 */
function setupTypes(types: typeClasses): types {
  const instances: types = {}
  for (let [key, value] of Object.entries(types)) {
    instances[key] = value.create()
  }
  return instances
}

/**
 * The Elder base class. Does the work of setting up and tying together
 * models, adapters, serializers and types
 */
export default class Elder extends Base {
  /**
   * Initialized serializer classes
   */
  serializers: serializers

  /**
   * Initialized adapter classes
   */
  adapters: adapters

  /**
   * Initialized and setup model classes
   */
  models: models

  /**
   * Initialized type classes
   */
  types: types

  /**
   * Configuration reference
   */
  config: config

  /**
   * Alternative to using `new`
   */
  static create(options: options) {
    return new this(options)
  }

  constructor(options: options) {
    super()

    this.config = options.config

    // setup serializers by merging default classes with those optionally given in
    // options before creating instances from classes and holding onto a reference
    const serializers = mergeSerializers(Serializer, options.serializers)
    this.serializers = setupSerializers(serializers)

    // setup adapters by merging default classes with those optionally given in
    // options before creating instances from classes and holding onto a reference
    const adapters = mergeAdapters(PostgresAdapter, options.adapters)
    this.adapters = setupAdapters(adapters, options.config.adapters)

    // setup types by merging default classes with those optionally given in
    // options before creating instances from classes and holding onto a reference
    const types = mergeTypes(options.types)
    this.types = setupTypes(types)

    // setup models by calling each models setup method passing initialized
    // serializers, adapters and types
    this.models = options.models || {}
    setupModels(this.models, this.types, this.adapters, this.serializers)
  }

  /**
   * Tears down connection pools allowing scripts to exit.
   */
  destroy(): any {
    return Promise.all(
      Object.entries(this.adapters).map(([key, value]) => {
        return this.adapters[key].destroy()
      })
    )
  }
}
