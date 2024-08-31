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
  try {
    const response = await axios.get(baseUrl, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: apiKey
      }
    });

    const data = response.data['Time Series (Daily)'] || {};
    const filteredData = {};
    const start = new Date(startDate);

    // Filter data to include only dates after the latest date
    for (const [date, metrics] of Object.entries(data)) {
      const dataDate = new Date(date);
      if (dataDate > start) {
        filteredData[date] = metrics;
      }
    }

    return filteredData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return {};
  }
};

const updateDatabase = async () => {
  const client = await pool.connect();
  try {
    for (const [tickerSymbol, avSymbol] of Object.entries(stocks)) {
      const latestDate = await getLatestDate(tickerSymbol);
      const data = await fetchStockData(avSymbol, latestDate);
      for (const [date, metrics] of Object.entries(data)) {
        q = `
          INSERT INTO stocks (ticker_symbol, date, open_price, high_price, low_price, close_price, adj_close_price, volume)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `
        v = [
            tickerSymbol,
            date,
            metrics['1. open'],
            metrics['2. high'],
            metrics['3. low'],
            metrics['4. close'],
            metrics['5. adjusted close'],
            metrics['5. volume']
          ]
        console.log(v)
        await client.query(q, v);
      }
    }
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    client.release();
  }
};

// Run the update function
updateDatabase();
