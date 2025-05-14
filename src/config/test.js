require('dotenv').config({ path: '.env.test' });

module.exports = {
  database: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT)
  },
  server: {
    port: Number(process.env.PORT)
  },
  jwt: {
    secret: process.env.JWT_SECRET
  },
  env: process.env.NODE_ENV
}; 