// Load environment variables from .env file
require('dotenv').config();

// Import pg module
const { Pool } = require('pg');

// Create a new pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_DATABASE,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring client', err.stack);
  }
  console.log('✅ Connected to PostgreSQL database successfully!');
  release(); // Release the client back to the pool
});

// Export pool for use in other files
module.exports = pool;
