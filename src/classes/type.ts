/**
 * IType interface defines how a model type needs to be defined.
 */
export interface IType {
  /**
   * Called when accessing a model's property. Can be used to convert the
   * property to another format though will often simply pass the value on
   */
  access(value: any, options?: options): any

  /**
   * Called when modifying a model's property. Can be overridden in order to
   * throw TypeErrors when the given value is unacceptabe or to cast the given
   * value as appropriate
   */
  modify(value: any, options?: options): any

  /**
   * Called when the property value needs to be saved to the database.
   * Values need to be converted to strings if they are not strings already.
   *
   * Examples:
   *
   * Converting date objects into database string formats
   * ```
   * store (value: Date): string {
   *   return value.toISOString()
   * }
   * ```
   *
   * Serializing objects to json for storage
   * ```
   * store (value: any): string {
   *   return JSON.stringify(value)
   * }
   * ```
   */
  store(value: any, options?: options): string

  /**
   * Called when the value for the property has been retrieved from the database
   *
   * Examples:
   *
   * Deserializing json strings into objects
   * ```
   * retrieve (value: string): any {
   *   return JSON.parse(value)
   * }
   * ```
   *
   * Converting strings to numbers
   * ```
   * retrieve (value: string): number {
   *   return Number(value)
   * }
   * ```
   */
  retrieve(value: string, options?: options): any

  /**
   * Called by a models `validate` method which is itself called by the model's
   * `save` method.
   *
   * This method may synchronously validate by throwing a `ValidationError`
   * directly or asynchronously by returning a `ValidationError` wrapped in a
   * `Promise.reject`
   *
   * Examples:
   *
   * sync
   * ```
   * validate (value: number): ValidationError | void {
   *   if (value < 10 || value > 20) {
   *     const msg = `Expected value to be greater than 10 and less
   *       than 20 but got: ${value}`
   *     throw new ValidationError(msg)
   *   }
   * }
   * ```
   *
   * async
   * ```
   * validate (value: number): Promise<ValidationError> | void {
   *   if (value < 10 || value > 20) {
   *     const msg = `Expected value to be greater than 10 and less
   *       than 20 but got: ${value}`
   *     return Promise.reject(new ValidationError(msg))
   *   }
   * }
   * ```
   */
  validate<T extends Error>(
    value: any,
    options?: options
  ): Promise<void | T> | void | T
}

/**
 * Base implementation of a model type.
 */
export default class Type implements IType {
  static create<T extends typeof Type>(
    this: T,
    ...args: any[]
  ): T['prototype'] {
    return new this(...args)
  }
  /**
   * Default implementation of type access.
   * Simply returns the value as is without modification.
   */
  access(value: any, options?: options): any {
    return value
  }

  /**
   * Default implementation of type modification.
   * Simply returns the value as is without modification.
   */
  modify(value: any, options?: options): any {
    return value
  }

  /**
   * Default implementation of type storage.
   * Attempts to convert any value given to a string.
   */
  store(value: any, options?: options): string {
    return String(value)
  }

  /**
   * Default implementation of type retrieval.
   * Simply returns the value as is without modification.
   */
  retrieve(value: string, options?: options): any {
    return value
  }

  /**
   * Default signature of type validation with no additional implemenation
   * details.
   */
  validate(value: any, options?: options): void {}
}

export type options = {
  [key: string]: any
}
