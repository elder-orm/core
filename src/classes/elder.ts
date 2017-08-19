import Model from './model'
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

export type modelStore = {
  [name: string]: typeof Model
}

export type typeStore = {
  [name: string]: typeof Type
}

export type elderConfig = {
  config: config
  types?: typeStore
  models: modelStore
  adapters?: {
    [name: string]: typeof Adapter
  }
  serializers?: {
    [name: string]: typeof Serializer
  }
}

export default class Elder extends Base {
  serializers: { [name: string]: typeof Serializer }
  adapters: { [name: string]: typeof Adapter }
  models: { [name: string]: typeof Model }
  types: { [name: string]: typeof Type }
  config: config

  static create(config: elderConfig) {
    return new this(config)
  }

  setupModels(models: modelStore, types: typeStore) {
    Object.keys(models).forEach(modelRef => {
      const Model = models[modelRef]
      Object.keys(Model.meta.attributeDefinition).forEach(attr => {
        let typeName = Model.meta.attributeDefinition[attr]
        if (types[`${Model.modelName}:${typeName}`]) {
          typeName = `${Model.modelName}:${typeName}`
        }
        const Type = types[typeName]
        const instance = Type.create()
        Model.meta.attributes[attr] = instance
      })
    })
  }

  constructor(config: elderConfig) {
    super()

    this.serializers = Object.assign(
      {},
      {
        default: Serializer
      },
      config.serializers
    )

    this.adapters = Object.assign(
      {},
      {
        default: PostgresAdapter
      },
      config.adapters
    )

    this.types = Object.assign(
      {},
      {
        string: StringType,
        number: NumberType,
        date: DateType,
        boolean: BooleanType
      },
      config.types
    )

    this.models = config.models || {}

    this.config = config.config

    this.setupModels(this.models, this.types)
  }
}
