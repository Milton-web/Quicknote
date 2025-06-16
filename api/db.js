
const { Pool } = require('pg');

// Ladda miljövariabler om du använder .env
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
