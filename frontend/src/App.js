import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Watchlist from './components/Watchlist';
import AddStock from './components/AddStock';
import StockDetails from './components/StockDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Watchlist />} />
          <Route path="/add-stock" element={<AddStock />} />
          <Route path="/stock/:tickerSymbol" element={<StockDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;