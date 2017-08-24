exports.up = (knex, Promise) => {
  return knex.schema.dropTableIfExists('cat').then(() => {
    return knex.schema.createTable('cat', table => {
      table.increments()
      table.string('name')
      table.string('color')
      table.string('breed')
    })
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('cat')
}
