exports.seed = (knex, Promise) => {
  // Deletes ALL existing entries
  return knex('cat').del().then(() => {
    // Inserts seed entries
    return knex('cat').insert([
      { name: 'Fluffy', color: 'grey', breed: 'Abyssinian' },
      {
        name: 'Rt Hon. Douglas Meow',
        color: 'brown',
        breed: 'American Shorthair'
      }
    ])
  })
}
