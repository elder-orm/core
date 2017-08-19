import Model from '../classes/model'
import Type from '../classes/type'
import { StringType, NumberType, DateType, BooleanType } from '../types'

export default function type(
  typeName: string
): (target: Model, propertyKey: string) => void {
  return function typeDecorator(target: Model, propertyKey: string): void {
    const Ctor = <typeof Model>target.constructor
    Ctor.meta.attributeDefinition[propertyKey] = typeName
  }
}
