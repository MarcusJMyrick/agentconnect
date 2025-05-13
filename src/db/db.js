require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  // Option A: via DATABASE_URL
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = pool; 