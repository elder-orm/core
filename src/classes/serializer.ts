import Model from './model'
import Base from './base'

export interface ISerializer {
  serialize(model: typeof Model, payload: any, options?: any): any
}

/**
 *
 */
export default class Serializer extends Base implements ISerializer {
  /**
   *
   */
  serialize(model: typeof Model, payload: any): any {
    return JSON.parse(JSON.stringify(payload))
  }
}
