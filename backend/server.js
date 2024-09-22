const express = require('express');
const pool = require('./db');
const cors = require('cors');
require('./updateStocks.js')

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Get all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (ticker_symbol)
        ticker_symbol,
        date,
        open_price,
        high_price,
        low_price,
        close_price,
        adj_close_price,
        volume
      FROM stocks
      ORDER BY ticker_symbol, date DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/stocks/:tickerSymbol', async (req, res) => {
  const { tickerSymbol } = req.params;
  const { period } = req.query; // Get the period from query params

  // Define SQL query based on period
  let query = `
    SELECT date, close_price
    FROM stocks
    WHERE ticker_symbol = $1
  `;

  switch (period) {
    case '5d':
      query += ' AND date >= CURRENT_DATE - INTERVAL \'5 days\'';
      break;
    case '3m':
      query += ' AND date >= CURRENT_DATE - INTERVAL \'3 months\'';
      break;
    case '6m':
      query += ' AND date >= CURRENT_DATE - INTERVAL \'6 months\'';
      break;
    case 'ytd':
      query += ' AND date >= DATE_TRUNC(\'year\', CURRENT_DATE)';
      break;
    case '1y':
      query += ' AND date >= CURRENT_DATE - INTERVAL \'1 year\'';
      break;
    case '5y':
      query += ' AND date >= CURRENT_DATE - INTERVAL \'5 years\'';
      break;
    case 'all':
      // No additional filter
      break;
    default:
      return res.status(400).send('Invalid period');
  }

  query += ' ORDER BY date ASC';

  try {
    const result = await pool.query(query, [tickerSymbol]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/stocks/:ticker_symbol/metrics', async (req, res) => {
  const ticker = req.params.ticker_symbol;
  
  try {
      const additionalMetricsQuery = `
          SELECT 
              MAX(close_price) AS max_price_52_week,
              MIN(close_price) AS min_price_52_week
          FROM stocks
          WHERE ticker_symbol = $1
            AND date >= NOW() - INTERVAL '1 year';
      `;

      const previousCloseQuery = `
          SELECT close_price
          FROM stocks
          WHERE ticker_symbol = $1
          ORDER BY date DESC
          OFFSET 1 LIMIT 1;
      `;

      // Execute the two queries in parallel
      const [metricsResult, previousCloseResult] = await Promise.all([
          pool.query(additionalMetricsQuery, [ticker]),
          pool.query(previousCloseQuery, [ticker])
      ]);

      if (metricsResult.rows.length === 0 || previousCloseResult.rows.length === 0) {
          return res.status(404).json({ error: 'Metrics or previous close not found' });
      }

      const additionalMetrics = metricsResult.rows[0];
      const previousClose = previousCloseResult.rows[0].close_price;

      res.json({
          max_price_52_week: additionalMetrics.max_price_52_week,
          min_price_52_week: additionalMetrics.min_price_52_week,
          previous_close: previousClose
      });
      
  } catch (error) {
      console.error('Error fetching stock metrics:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
