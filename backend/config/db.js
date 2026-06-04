const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.DATABASE_URL && 
  process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD || null,
        port: process.env.DB_PORT,
      }
);

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully!');
    release();
  }
});

module.exports = pool;