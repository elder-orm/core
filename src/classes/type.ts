import Base from './base'

/**
 * IType interface defines how a model type needs to be defined.
 */
export interface IType {
  /**
   * Called when accessing a model's property. Can be used to convert the
   * property to another format though will often simply pass the value on
   */
  access(value: any): any

  /**
   * Called when modifying a model's property. Can be overridden in order to
   * throw TypeErrors when the given value is unacceptabe or to cast the given
   * value as appropriate
   */
  modify(value: any): any

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
  store(value: any): string

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
  retrieve(value: string): any

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
  validate<T extends Error>(value: any): Promise<void | T> | void | T
}

/**
 * Base implementation of a model type.
 */
export default abstract class Type extends Base implements IType {
  /**
   * Default implementation of type access.
   * Simply returns the value as is without modification.
   */
  access(value: any): any {
    return value
  }

  /**
   * Default implementation of type modification.
   * Simply returns the value as is without modification.
   */
  modify(value: any): any {
    return value
  }

  /**
   * Default implementation of type storage.
   * Attempts to convert any value given to a string.
   */
  store(value: any): string {
    return String(value)
  }

  /**
   * Default implementation of type retrieval.
   * Simply returns the value as is without modification.
   */
  retrieve(value: string): any {
    return value
  }

  /**
   * Default signature of type validation with no additional implemenation
   * details.
   */
  validate(value: any): void {}
}
