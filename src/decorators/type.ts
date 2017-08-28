import Model from '../classes/model'

export default function type(
  typeName: string
): (target: Model, propertyKey: string) => void {
  return function typeDecorator(target: Model, propertyKey: string): void {
    const Ctor = target.constructor as typeof Model
    Ctor.meta.attributeDefinition[propertyKey] = typeName
  }
}
