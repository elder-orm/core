exports.seed = (knex, Promise) => {
  // Deletes ALL existing entries
  return knex('cat').del().then(() => {
    // Inserts seed entries
    return knex('cat').insert([
      {
        name: 'Fluffy',
        color: 'grey',
        breed: 'Abyssinian',
        created_at: '2017-08-28T20:17:25.601Z',
        age: 12,
        is_active: true
      },
      {
        name: 'Rt Hon. Douglas Meow',
        color: 'brown',
        breed: 'American Shorthair',
        created_at: '2017-07-28T20:17:25.601Z',
        age: 10,
        is_active: true
      }
    ])
  })
}
