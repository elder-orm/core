export type decorator = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => any
