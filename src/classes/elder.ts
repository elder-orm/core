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
    default: typeof Adapter
    [name: string]: typeof Adapter
  }
  serializers?: {
    default: typeof Serializer
    [name: string]: typeof Serializer
  }
}

export type adapters = {
  default: Adapter
  [name: string]: Adapter
}

function setupModels(
  models: modelStore,
  types: typeStore,
  adapterInstances: adapters,
  serializerInstances: serializers
) {
  Object.keys(models).forEach(modelRef => {
    const Model = models[modelRef]

    Model.adapter = adapterInstances.default
    for (let [key, value] of Object.entries(adapterInstances)) {
      if (key === 'default') continue
      if (key === Model.modelName) {
        Model.adapter = value
      }
    }

    Model.serializers = serializerInstances

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

export default class Elder extends Base {
  serializers: { [name: string]: typeof Serializer }
  serializerInstances: serializers
  adapters: {
    default: typeof Adapter
    [name: string]: typeof Adapter
  }
  adapterInstances: {
    default: Adapter
    [name: string]: Adapter
  }
  models: { [name: string]: typeof Model }
  types: { [name: string]: typeof Type }
  config: config

  static create(config: elderConfig) {
    return new this(config)
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

    this.serializerInstances = {
      default: this.serializers.default.create()
    }

    for (let [key, value] of Object.entries(this.serializers)) {
      if (key === 'default') continue
      this.serializerInstances[key] = value.create()
    }

    this.adapters = Object.assign(
      {},
      {
        default: PostgresAdapter
      },
      config.adapters
    )

    this.adapterInstances = {
      default: this.adapters.default.create(config.config.adapters.default)
    }

    for (let [key, value] of Object.entries(this.adapters)) {
      if (key === 'default') continue
      this.adapterInstances[key] = value.create(config.config.adapters[key])
    }

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

    setupModels(
      this.models,
      this.types,
      this.adapterInstances,
      this.serializerInstances
    )
  }

  destroy(): any {
    return Promise.all(
      Object.entries(this.adapterInstances).map(([key, value]) => {
        return this.adapterInstances[key].destroy()
      })
    )
  }
}
