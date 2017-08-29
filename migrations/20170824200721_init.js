exports.up = (knex, Promise) => {
  return knex.schema.dropTableIfExists('cat').then(() => {
    return knex.schema.createTable('cat', table => {
      table.increments()
      table.string('name')
      table.string('color')
      table.string('breed')
      table.timestamp('created_at')
      table.integer('age')
      table.boolean('is_active')
    })
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('cat')
}
