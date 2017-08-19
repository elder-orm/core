import Model from './model'

export interface ISerializer {
  serialize(model: typeof Model, payload: any, options?: any): any
}

/**
 *
 */
export default class Serializer implements ISerializer {
  /**
   *
   */
  serialize(model: typeof Model, payload: any): any {
    return payload
  }
}
