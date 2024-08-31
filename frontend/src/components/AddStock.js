import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddStock() {
  const [tickerSymbol, setTickerSymbol] = useState('');
  const navigate = useNavigate();

  const handleAddStock = (e) => {
    e.preventDefault();
    // Logic to add stock to your watchlist here
    // Once added, redirect back to the watchlist
    navigate('/');
  };

  return (
    <div>
      <h2>Add a New Stock</h2>
      <form onSubmit={handleAddStock}>
        <input
          type="text"
          value={tickerSymbol}
          onChange={(e) => setTickerSymbol(e.target.value)}
          placeholder="Ticker Symbol"
          required
        />
        <button type="submit">Add Stock</button>
      </form>
    </div>
  );
}

export default AddStock;
