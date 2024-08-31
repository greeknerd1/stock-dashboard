import React from 'react';
import { Link } from 'react-router-dom';

function Watchlist() {
  const stocks = [
    { ticker_symbol: 'AAPL', latest_share_price: 150 },
    { ticker_symbol: 'GOOGL', latest_share_price: 2800 },
    // Add more stocks here
  ];

  return (
    <div>
      <h2>My Watchlist</h2>
      <ul>
        {stocks.map(stock => (
          <li key={stock.ticker_symbol}>
            <Link to={`/stock/${stock.ticker_symbol}`}>
              {stock.ticker_symbol}: ${stock.latest_share_price}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/add-stock">Add Stock</Link>
    </div>
  );
}

export default Watchlist;
