import Model from './model'
import { SerializableArray } from './util'
import Base from './base'
import Type from './type'
import Adapter from './adapter'
import Serializer from './serializer'

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

export type elderConfig = {
  config: config
  types?: { [name: string]: typeof Type }
  models: {
    [name: string]: typeof Model
  }
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

  constructor(config: elderConfig) {
    super()
    this.serializers = config.serializers || {}
    this.adapters = config.adapters || {}
    this.models = config.models || {}
    this.types = config.types || {}
    this.config = config.config
  }
}
