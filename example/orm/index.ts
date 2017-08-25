import Elder from '../../src'
import config from './.elder'

import AgeType from './types/age'

import DefaultAdapter from './adapter'

import DefaultSerializer from './serializers/default'
import JSONAPISerializer from './serializers/jsonapi'

import Cat from './models/cat/model'
import CatAdapter from './models/cat/adapter'
import CatColorType from './models/cat/types/color'
import CatNameType from './models/cat/types/name'
import CatSpeciesType from './models/cat/types/breed'

export default Elder.create({
  config,
  models: {
    // map model names to models
    cat: Cat
  },
  types: {
    age: AgeType, // this general type will be available to any model
    'cat:name': CatNameType, // these scoped types will only be available to the cat model
    'cat:color': CatColorType,
    'cat:breed': CatSpeciesType
  },
  adapters: {
    // this section can be omitted in which case a postgres adapter will be used
    default: DefaultAdapter, // all models use this adapter unless a specific adapter is provided
    cat: CatAdapter // use a specific adapter just for cats. Maps modelName => adapter to use
  },
  serializers: {
    // sane defaults will be used if this section is omitted
    default: DefaultSerializer, // add a default serializer and a jsonapi serializer
    jsonapi: JSONAPISerializer
  }
})
