module.exports = {
  database: {
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'dpi-pttl-6',
    password: process.env.PG_PASSWORD || '',
    database: 'agentconnect_test',
    port: process.env.PG_PORT || 5432
  },
  server: {
    port: process.env.PORT || 3002
  },
  env: 'test'
}; 