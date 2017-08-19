import belongsTo from './decorators/belongs-to'
import hasMany from './decorators/has-many'
import type from './decorators/type'
import Model from './classes/model'
import Adapter from './classes/adapter'
import Elder from './classes/elder'
import Type from './classes/type'
import Serializer from './classes/serializer'

export { belongsTo, hasMany, type, Model, Adapter, Serializer, Type }

export default Elder
