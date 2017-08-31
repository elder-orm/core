import * as Knex from 'knex'
import { underscore } from 'inflection'
import Model from './model'
import DatabaseConnectionError from './errors/connection-error'

const first = (arr: any[]): any => arr[0] || null

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

function sanitize(
  Ctor: typeof Model,
  props: { [key: string]: any }
): { [key: string]: any } {
  const validPropKeys: string[] = Object.keys(props).filter(prop =>
    Reflect.ownKeys(Ctor.meta.attributes).includes(prop)
  )
  const validProps: { [key: string]: any } = {}
  for (let prop of validPropKeys) {
    validProps[underscore(prop)] = props[prop]
  }
  return validProps
}

export type pojo = {
  [key: string]: any
}

function clone(obj: pojo): pojo {
  return JSON.parse(JSON.stringify(obj))
}

export default class Adapter {
  knex: Knex
  config: databaseConfig

  constructor(config: databaseConfig) {
    this.config = config
    this.knex = Knex({
      client: 'pg',
      connection: config
    })
  }

  static create<T extends typeof Adapter>(
    this: T,
    config: databaseConfig,
    ...args: any[]
  ): T['prototype'] {
    return new this(config, ...args)
  }

  async checkConnection() {
    try {
      await this.knex.raw('SELECT 1 = 1;')
    } catch (e) {
      const conf = clone(this.config)
      if (conf.password) {
        conf.password = '********'
      }
      throw new DatabaseConnectionError(
        `Unable to connect to database '${this.config
          .database}' using adapter '${this.constructor
          .name}' and config '${JSON.stringify(conf)}'`
      )
    }
  }

  paginate(
    query: Knex.QueryBuilder,
    options: { limit?: number; page?: number }
  ) {
    const page = options.page || 1
    const limit = options.limit || 20
    return query.limit(limit).offset(page * limit - limit)
  }

  sort(query: Knex.QueryBuilder, sortString = '') {
    if (sortString) {
      sortString.split(',').forEach(column => {
        const direction = column.includes('-') ? 'DESC' : 'ASC'
        column = column.replace('-', '')
        query = query.orderBy(column.trim(), direction)
      })
    }
    return query
  }

  fieldsForModel(Ctor: typeof Model) {
    return Object.keys(Ctor.meta.attributes)
  }

  databaseFieldsForModel(Ctor: typeof Model) {
    return this.fieldsForModel(Ctor).map(field => underscore(field))
  }

  columnsForModel(Ctor: typeof Model) {
    const modelAttrs = this.fieldsForModel(Ctor)
    const databaseAttrs = this.databaseFieldsForModel(Ctor)
    return databaseAttrs.map((dbAttr, i) => `${dbAttr} as ${modelAttrs[i]}`)
  }

  limitFieldSet(Ctor: typeof Model, fieldNames: string[] = []) {
    // always include id field
    if (!fieldNames.includes(Ctor.idField)) {
      fieldNames.push(Ctor.idField)
    }

    // create a field map from model attr name to db column name eg. {myTitle => my_title, etc}
    const modelFields = this.fieldsForModel(Ctor)
    const dbFields = this.databaseFieldsForModel(Ctor)
    const fieldMap = modelFields.map((modelField, i) => ({
      nameForModel: modelField,
      nameForDb: dbFields[i]
    }))

    // filter out using fieldNames and return array of strings ['my_title as myTitle', etc]
    return fieldMap
      .filter(
        fieldMapping => fieldNames.indexOf(fieldMapping.nameForModel) !== -1
      )
      .map(
        fieldMapping =>
          `${fieldMapping.nameForDb} as ${fieldMapping.nameForModel}`
      )
  }

  // include (Ctor: typeof Model, query: Knex.QueryBuilder, includeString:string = '', fieldOptions) {
  //   return query.then(data => {
  //     data = JSON.parse(JSON.stringify(data))
  //     let single = false
  //     if (!Array.isArray(data)) {
  //       single = true
  //       data = [data]
  //     }
  //     return Promise.all(includeString.split(',').map(include => {
  //       include = include.trim()
  //       if (include.includes('.')) return
  //       const definition = get(Model, `definition.relationships.${include}`)
  //       if (!definition) return
  //       const RelatedModel = this.store.modelFor(definition.modelTo)
  //       if (!RelatedModel) return
  //       let query = this.knex(RelatedModel.tableName)

  //       let attributes = this.columnsForModel(Model)
  //       if (fieldOptions) attributes = this.limitFieldSet(RelatedModel, attributes, fieldOptions)
  //       query = query.column(attributes)

  //       let columns = []
  //       if (fieldOptions && fieldOptions[RelatedModel.type]) {
  //         columns = this.limitFieldSet(RelatedModel, fieldOptions[RelatedModel.type])
  //       } else {
  //         columns = this.columnsForModel(RelatedModel)
  //       }
  //       query = query.column(columns)

  //       let ids = data.map(item => item[definition.keyFrom])
  //       query = query.whereIn(definition.keyTo, ids)

  //       return query.then(relatedData => {
  //         const relatedDataGroups = new Map()
  //         relatedData.forEach(relData => {
  //           if (relatedDataGroups.has(relData[definition.keyTo])) {
  //             relatedDataGroups.get(relData[definition.keyTo]).push(relData)
  //           } else {
  //             relatedDataGroups.set(relData[definition.keyTo], [relData])
  //           }
  //         })
  //         return {name: include, definition, groupedData: relatedDataGroups}
  //       })
  //     }))
  //     .then(relationshipData => {
  //       data.forEach(item => {
  //         relationshipData.forEach(relationship => {
  //           const relData = relationship.groupedData.get(item[relationship.definition.keyFrom])
  //           if (relationship.definition.type === 'belongsTo') {
  //             item[relationship.name] = relData[0]
  //           } else {
  //             item[relationship.name] = relData
  //           }
  //         })
  //       })
  //       if (single) {
  //         data = data[0]
  //       }
  //       return JSON.parse(JSON.stringify(data))
  //     })
  //   })
  // }

  one(Ctor: typeof Model, where: where, options?: optsSingle) {
    return this.knex
      .table(Ctor.tableName)
      .column(this.columnsForModel(Ctor))
      .where(where)
      .first()
  }

  oneById(Ctor: typeof Model, id: number, options?: optsSingle) {
    return this.knex
      .table(Ctor.tableName)
      .column(this.columnsForModel(Ctor))
      .where(Ctor.idField, id)
      .first()
  }

  async oneBySql(
    Ctor: typeof Model,
    sql: string,
    params?: string[] | number[],
    options?: optsSingle
  ) {
    const result = await this.knex.raw(sql, params || [])
    return first(result.rows)
  }

  some(Ctor: typeof Model, where: where, options?: optsMultiple) {
    return this.knex
      .table(Ctor.tableName)
      .column(this.columnsForModel(Ctor))
      .where(where)
  }

  async someBySql(
    Ctor: typeof Model,
    sql: string,
    params?: string[] | number[],
    options?: optsMultiple
  ) {
    const result = await this.knex.raw(sql, params || [])
    return result.rows
  }

  async all(Ctor: typeof Model, options?: optsMultiple) {
    await this.checkConnection()
    options = options || {}

    let columns = []
    if (options.fields) {
      columns = this.limitFieldSet(Ctor, options.fields)
    } else {
      columns = this.columnsForModel(Ctor)
    }
    let query = this.knex.table(Ctor.tableName)
    query = query.column(columns)
    query = this.paginate(query, options)
    query = this.sort(query, options.sort)

    return query
  }

  async createRecord(Ctor: typeof Model, props: pojo): Promise<pojo> {
    const data = sanitize(Ctor, props)
    const result = await this.knex(Ctor.tableName)
      .insert(data)
      .returning(this.databaseFieldsForModel(Ctor))

    return clone(result[0])
  }

  async updateRecord(
    Ctor: typeof Model,
    key: string | number,
    props: { [name: string]: any }
  ): Promise<{ [name: string]: any }> {
    const idField: string = Ctor.idField
    const result = await this.knex(Ctor.tableName)
      .update(sanitize(Ctor, props))
      .where(idField, key)
      .returning(this.databaseFieldsForModel(Ctor))

    return clone(result[0])
  }

  async deleteRecord(Ctor: typeof Model, key: string | number): Promise<void> {
    const idField: string = Ctor.idField
    await this.knex(Ctor.tableName).delete().where(idField, key)
  }

  destroy(): Promise<void> {
    return new Promise(resolve => {
      this.knex.destroy().then(() => resolve())
    })
  }
}
