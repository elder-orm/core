import Model from '../classes/model'
import Type from '../classes/type'
import { StringType, NumberType, DateType, BooleanType } from '../types'

const selectType = (type: string): typeof Type => {
  switch (type) {
    case 'string':
      return StringType
    case 'number':
      return NumberType
    case 'date':
      return DateType
    case 'boolean':
      return BooleanType
  }
  throw new Error('Invalid type value given to @type decorator')
}

export default function type(
  typeName: string
): (target: Model, propertyKey: string) => void {
  return function typeDecorator(target: Model, propertyKey: string): void {
    const Ctor = <typeof Model>target.constructor
    Ctor.meta.attributes[propertyKey] = selectType(typeName).create()
  }
}
