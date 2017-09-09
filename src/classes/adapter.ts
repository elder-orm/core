import Model from './model'
import DatabaseConnectionError from './errors/connection-error'
export { DatabaseConnectionError }

export default class Adapter {
  config: databaseConfig

  constructor(config: databaseConfig) {
    this.config = config
  }

  static create<T extends typeof Adapter>(
    this: T,
    config: databaseConfig,
    ...args: any[]
  ): T['prototype'] {
    return new this(config, ...args)
  }

  one(Ctor: typeof Model, where: where, options?: optsSingle): Promise<pojo> {
    return Promise.resolve({})
  }

  oneById(Ctor: typeof Model, id: number, options?: optsSingle): Promise<pojo> {
    return Promise.resolve({})
  }

  oneBySql(
    Ctor: typeof Model,
    sql: string,
    params?: string[] | number[],
    options?: optsSingle
  ): Promise<pojo> {
    return Promise.resolve({})
  }

  some(
    Ctor: typeof Model,
    where: where,
    options?: optsMultiple
  ): Promise<pojo[]> {
    return Promise.resolve([])
  }

  someBySql(
    Ctor: typeof Model,
    sql: string,
    params?: string[] | number[],
    options?: optsMultiple
  ): Promise<pojo[]> {
    return Promise.resolve([])
  }

  all(Ctor: typeof Model, options?: optsMultiple): Promise<pojo[]> {
    return Promise.resolve([])
  }

  createRecord(Ctor: typeof Model, props: pojo): Promise<pojo> {
    return Promise.resolve({})
  }

  createSome(Ctor: typeof Model, records: pojo[]): Promise<number> {
    return Promise.resolve(0)
  }

  updateRecord(
    Ctor: typeof Model,
    key: string | number,
    props: { [name: string]: any }
  ): Promise<pojo> {
    return Promise.resolve({})
  }

  deleteRecord(Ctor: typeof Model, key: string | number): Promise<void> {
    return Promise.resolve()
  }

  deleteAll(Ctor: typeof Model): Promise<number> {
    return Promise.resolve(0)
  }

  deleteSome(Ctor: typeof Model, where: where): Promise<number> {
    return Promise.resolve(0)
  }

  deleteOne(Ctor: typeof Model, where: where): Promise<number> {
    return Promise.resolve(0)
  }

  deleteOneById(Ctor: typeof Model, id: number): Promise<number> {
    return Promise.resolve(0)
  }

  updateAll(Ctor: typeof Model, props: props): Promise<number> {
    return Promise.resolve(0)
  }

  updateSome(Ctor: typeof Model, where: where, props: props): Promise<number> {
    return Promise.resolve(0)
  }

  updateOneById(Ctor: typeof Model, id: number, props: props): Promise<number> {
    return Promise.resolve(0)
  }

  updateOne(Ctor: typeof Model, where: where, props: props): Promise<number> {
    return Promise.resolve(0)
  }

  truncate(Ctor: typeof Model): Promise<void> {
    return Promise.resolve()
  }

  countAll(Ctor: typeof Model): Promise<number> {
    return Promise.resolve(0)
  }

  countSome(Ctor: typeof Model, where: where): Promise<number> {
    return Promise.resolve(0)
  }

  destroy(): Promise<void> {
    return Promise.resolve()
  }
}

export type databaseConfig = {
  database: string
  host?: string
  user?: string
  password?: string
  port?: number
}

export type optsMultiple = {
  include?: string | string[]
  sort?: string
  fields?: string[]
  limit?: number
  page?: number
}

export type optsSingle = {
  include?: string | string[]
  fields?: string[]
}

export type where = { [key: string]: any } | Array<any>
export type props = { [key: string]: any }

export type pojo = {
  [key: string]: any
}
