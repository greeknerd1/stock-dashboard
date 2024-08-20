// src/components/StocksList.js
import React, { useEffect, useState } from 'react';

function StocksList() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to make the API call when the component mounts
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stocks');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  if (loading) return <p>Loading stocks...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Stocks List</h2>
      <ul>
        {stocks.map(stock => (
          <li key={stock.ticker_symbol}>
            {stock.ticker_symbol}: ${stock.latest_share_price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StocksList;
