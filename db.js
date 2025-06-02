require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + '?sslmode=require'
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring client', err.stack);
  }
  console.log('✅ Connected to PostgreSQL database successfully!');
  release();
});

module.exports = pool;