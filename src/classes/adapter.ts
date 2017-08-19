import * as Knex from 'knex'
import { underscore } from 'inflection'
import { get } from 'lodash'
import Base from './base'
import Model from './model'

const first = (arr: any[]): any => arr[0] || null

const knex = Knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'digitalsadhu',
    password: '',
    database: 'ash'
  }
})

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

export type where =
  | {
      [key: string]: any
    }
  | Array<any>

export default class Adapter extends Base {
  async checkConnection() {
    try {
      await knex.raw('SELECT 1 = 1;')
    } catch (e) {
      throw new Error(`Adapter: database connection failed?`)
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
    const modelFields = this.fieldsForModel(Model)
    const dbFields = this.databaseFieldsForModel(Model)
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
    return knex.table(Ctor.tableName).where(where).first()
  }
  oneById(Ctor: typeof Model, id: number, options?: optsSingle) {
    return knex.table(Ctor.tableName).where(Ctor.idField, id).first()
  }
  async oneBySql(
    Ctor: typeof Model,
    sql: string,
    params?: string[] | number[],
    options?: optsSingle
  ) {
    const result = await knex.raw(sql, params || [])
    return first(result.rows)
  }
  some(Ctor: typeof Model, where: where, options?: optsMultiple) {
    return knex.table(Ctor.tableName).where(where)
  }
  async someBySql(
    Ctor: typeof Model,
    sql: string,
    params?: string[] | number[],
    options?: optsMultiple
  ) {
    const result = await knex.raw(sql, params || [])
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
    let query = knex.table(Ctor.tableName)
    query = query.column(columns)
    query = this.paginate(query, options)
    query = this.sort(query, options.sort)

    return query
  }
}
