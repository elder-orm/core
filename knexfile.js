module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    },
    migrations: {
      tableName: 'migrations'
    }
  }
}
