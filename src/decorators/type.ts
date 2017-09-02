import Model from '../classes/model'

export default function type(
  typeName: string,
  options?: { [name: string]: any }
): (target: Model, propertyKey: string) => void {
  return function typeDecorator(target: any, propertyKey: string): void {
    const Ctor = target.constructor as typeof Model

    const instance: any = Ctor.create()
    if (instance[propertyKey]) {
      throw new Error(`
        Invalid default assignment to property '${propertyKey}' of model '${Ctor.name}'.
          Expected default value '${instance[
            propertyKey
          ]}' to be assigned in decorator.

          Example usage.
            @type('${typeName}', {default: '${instance[propertyKey]}'}) name
      `)
    }

    const meta = {
      attributeDefinition: {},
      attributes: {},
      relationships: {}
    }

    if (!Reflect.ownKeys(Ctor).includes('meta')) {
      Reflect.defineProperty(Ctor, 'meta', {
        value: meta
      })
    }

    Ctor.meta.attributeDefinition[propertyKey] = { type: typeName }
    if (options && options.default) {
      Ctor.meta.attributeDefinition[propertyKey].default = options.default
    }
  }
}
