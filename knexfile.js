const config = {
  client: 'postgresql',
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER
  },
  migrations: {
    tableName: 'migrations'
  }
}

module.exports = {
  development: config,
  test: config,
  production: config
}
