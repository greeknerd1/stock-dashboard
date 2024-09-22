import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Watchlist.css'; // Import your CSS file

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

function Watchlist() {
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
            <h2>My Watchlist</h2>
            <table>
                <thead>
                    <tr>
                        <th>Ticker Symbol</th>
                        <th>Latest Date</th>
                        <th>Latest Closing Price</th>
                        <th>Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map(stock => (
                        <tr key={stock.ticker_symbol}>
                            <td>
                                <Link to={`/stock/${stock.ticker_symbol}`}>
                                    {stock.ticker_symbol}
                                </Link>
                            </td>
                            <td>{formatDate(stock.date)}</td>
                            <td>${stock.close_price}</td>
                            <td>{stock.volume}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Link to="/add-stock">Add Stock</Link>
        </div>
    );
}

export default Watchlist;
