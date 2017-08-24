const DB_NAME: string = process.env.DB_NAME || ''
const DB_USER: string = process.env.DB_USER || ''

export default Object.freeze({
  adapters: {
    default: { database: DB_NAME, user: DB_USER },
    cat: { database: DB_NAME, user: DB_USER }
  }
})
