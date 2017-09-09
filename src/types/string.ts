import Type, { options } from '../classes/type'

/**
 * Basic string `Type` for use with model type decorator to define model
 * properties.
 *
 * Example:
 * ```
 * class MyModel extends Model {
 *   @type('string') myProp
 * }
 * ```
 */
export default class StringType extends Type {
  modify(value: string | number, options: options): string {
    return String(value)
  }

  store(value: string, options: options): string {
    return value
  }

  retrieve(value: string, options: options): string {
    return value
  }
}
