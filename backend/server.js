const express = require('express');
const pool = require('./db');
const cors = require('cors'); // Optional, if you installed it
require('./updateStocks.js')

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Optional

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/stocks', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT ON (ticker_symbol)
    ticker_symbol,
    date,
    open_price,
    high_price,
    low_price,
    close_price,
    adj_close_price,
    volume
FROM
    stocks
ORDER BY
    ticker_symbol,
    date DESC;
`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});