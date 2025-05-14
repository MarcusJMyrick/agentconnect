require('dotenv').config();
const { Pool } = require('pg');

const isTest = process.env.NODE_ENV === 'test';

const pool = new Pool({
  host:     process.env.PG_HOST || 'localhost',
  user:     process.env.PG_USER || 'dpi-pttl-6',
  password: process.env.PG_PASSWORD || '',
  database: isTest ? 'agentconnect_test' : 'agentconnect',
  port:     process.env.PG_PORT || 5432
});

module.exports = pool; 