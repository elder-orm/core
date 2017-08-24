exports.seed = (knex, Promise) => {
  // Deletes ALL existing entries
  return knex('cat').del().then(() => {
    // Inserts seed entries
    return knex('cat').insert([
      { id: 1, name: 'Fluffy', color: 'grey', breed: 'Abyssinian' },
      {
        id: 2,
        name: 'Rt Hon. Douglas Meow',
        color: 'brown',
        breed: 'American Shorthair'
      }
    ])
  })
}
