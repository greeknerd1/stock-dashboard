const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'stock_dashboard',
  password: 'password',
  port: 5432,
});

module.exports = {pool};
