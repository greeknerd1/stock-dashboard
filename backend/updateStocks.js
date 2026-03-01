const axios = require('axios');
const pool = require('./db');
require('dotenv').config();

// Alpha Vantage API details
const apiKey = process.env.AV_API_KEY;
const baseUrl = 'https://www.alphavantage.co/query';

// List of stocks and their Alpha Vantage symbols
const stocks = {
  'MSFT': 'MSFT',
  'GOOGL': 'GOOGL',
  'AMZN': 'AMZN',
  'NVDA': 'NVDA',
  'TSLA': 'TSLA',
  'BRK-B': 'BRK-B',
  'META': 'META',
  'UNH': 'UNH',
  'XOM': 'XOM',
  'AAPL': 'AAPL'
};

const REQUEST_DELAY_MS = 1200;
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitedPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  const info = payload.Information || payload.Note || '';
  return /rate limit|requests per day|requests per second|thank you for using alpha vantage/i.test(info);
};

// Function to get the latest date for a specific stock
const getLatestDate = async (tickerSymbol) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT MAX(date) AS latest_date
      FROM stocks
      WHERE ticker_symbol = $1
    `, [tickerSymbol]);

    return result.rows[0].latest_date || null;
  } catch (error) {
    console.error(`Error fetching latest date for ${tickerSymbol}:`, error);
    return null;
  } finally {
    client.release();
  }
};

// Function to fetch stock data from Alpha Vantage
const fetchStockData = async (symbol, startDate) => {
  const start = startDate ? new Date(startDate) : null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          apikey: apiKey
        }
      });

      const payload = response.data || {};

      if (isRateLimitedPayload(payload)) {
        const waitMs = REQUEST_DELAY_MS * attempt;
        console.warn(`[${symbol}] Alpha Vantage rate limit hit (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${waitMs}ms.`);
        await sleep(waitMs);
        continue;
      }

      if (payload['Error Message']) {
        console.error(`[${symbol}] Alpha Vantage error: ${payload['Error Message']}`);
        return {};
      }

      const data = payload['Time Series (Daily)'];
      if (!data) {
        console.error(`[${symbol}] Unexpected Alpha Vantage payload. Keys: ${Object.keys(payload).join(', ')}`);
        return {};
      }

      const filteredData = {};
      for (const [date, metrics] of Object.entries(data)) {
        const dataDate = new Date(date);
        if (!start || dataDate > start) {
          filteredData[date] = metrics;
        }
      }

      return filteredData;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`Error fetching data for ${symbol} after ${MAX_RETRIES} attempts:`, error.message);
        return {};
      }
      const waitMs = REQUEST_DELAY_MS * attempt;
      console.warn(`[${symbol}] Request failed on attempt ${attempt}/${MAX_RETRIES}. Retrying in ${waitMs}ms.`);
      await sleep(waitMs);
    }
  }

  console.error(`[${symbol}] Failed to fetch data due to repeated rate limiting.`);
  return {};
};

const updateDatabase = async () => {
  const client = await pool.connect();
  try {
    for (const [tickerSymbol, avSymbol] of Object.entries(stocks)) {
      const latestDate = await getLatestDate(tickerSymbol);
      const data = await fetchStockData(avSymbol, latestDate);

      let insertedRows = 0;
      for (const [date, metrics] of Object.entries(data)) {
        const q = `
          INSERT INTO stocks (ticker_symbol, date, open_price, high_price, low_price, close_price, adj_close_price, volume)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `
        const v = [
          tickerSymbol,
          date,
          metrics['1. open'],
          metrics['2. high'],
          metrics['3. low'],
          metrics['4. close'],
          metrics['5. adjusted close'],
          metrics['5. volume']
        ];

        await client.query(q, v);
        insertedRows += 1;
      }

      if (insertedRows === 0) {
        console.log(`[${tickerSymbol}] No new rows inserted.`);
      } else {
        console.log(`[${tickerSymbol}] Inserted ${insertedRows} new rows.`);
      }

      // Space out requests across symbols to avoid burst limit.
      await sleep(REQUEST_DELAY_MS);
    }
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    client.release();
  }
};

// Run the update function
updateDatabase();
