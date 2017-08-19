import StringType from './types/string'
import Elder, { Model, type } from './'

class Cat extends Model {
  @type('string') name: string
  @type('string') color: string
  @type('string') species: string
}

const orm = Elder.create({
  config: {
    adapters: {
      default: {
        database: 'ash'
      }
    }
  },
  models: {
    cat: Cat
  }
})

console.log(orm)

async function main() {
  let cats
  let cat

  cats = await Cat.all()
  console.log('ALL:', cats)

  console.log(cats[0].name)
  cats[0].name = 'something'

  // cats = await Cat.all({include: 'owners', sort: '-name', limit: 10, page: 1})
  // console.log('ALL (with opts):', cats)

  // cats = await Cat.some({name: 'fluffy'})
  // console.log('SOME:', cats)

  // cats = await Cat.some({name: 'fluffy'}, {include: 'owners', sort: 'id', limit: 10, page: 2})
  // console.log('SOME (with opts):', cats)

  // cats = await Cat.someBySql('SELECT * FROM cat WHERE name = ?', ['fluffy'])
  // console.log('SOME (bySQL):', cats)

  // cat = await Cat.one({name: 'fluffy'})
  // console.log('ONE:', cats)

  // cat = await Cat.oneById(1)
  // console.log('ONE (byId):', cats)

  // cat = await Cat.oneBySql('SELECT * FROM cat WHERE name = ?', ['fluffy'])
  // console.log('ONE (bySQL):', cats)
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
