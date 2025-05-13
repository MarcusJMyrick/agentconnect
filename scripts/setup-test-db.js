const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../src/config/test');

async function setupTestDatabase() {
  // First connect to postgres database to create our test database
  const adminPool = new Pool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: 'postgres',
    port: config.database.port
  });

  try {
    // Create test database if it doesn't exist
    await adminPool.query(`DROP DATABASE IF EXISTS ${config.database.database}`);
    await adminPool.query(`CREATE DATABASE ${config.database.database}`);
    await adminPool.end();

    // Connect to the test database
    const testPool = new Pool({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port
    });

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await testPool.query(schema);

    console.log('Test database setup completed successfully');
    await testPool.end();
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDatabase(); 