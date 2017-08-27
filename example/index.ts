import orm from './orm'
const { cat: Cat } = orm.models

async function main() {
  const cats = await Cat.all()

  // unserialized
  console.log('unserialized', cats)

  // serializing
  console.log('converting model to json', cats[0].toJSON())
  console.log('serializing a collection', cats.serialize())
  console.log('serializing an individual model', cats[0].serialize())
  console.log(
    'serializing using non default serializer',
    cats[0].serialize('jsonapi')
  )
}

main().then(() => orm.destroy()).catch(err => console.log(err))
