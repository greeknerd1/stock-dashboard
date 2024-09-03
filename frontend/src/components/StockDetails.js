import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components used in the chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

function StockDetails() {
  const { tickerSymbol } = useParams();
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1y'); // Default period

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        // Fetch stock data based on selected period
        const response = await fetch(`http://localhost:5000/api/stocks/${tickerSymbol}?period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [tickerSymbol, selectedPeriod]);

  if (loading) return <p>Loading stock details...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Prepare data for the chart
  const chartData = {
    labels: stockData.map(item => formatDate(item.date)),
    datasets: [{
      label: 'Closing Price',
      data: stockData.map(item => item.close_price),
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
    }],
  };

  return (
    <div>
      <h2>Stock Details for {tickerSymbol}</h2>
      <div>
        <button onClick={() => setSelectedPeriod('5d')}>5 Day</button>
        <button onClick={() => setSelectedPeriod('3m')}>3 Month</button>
        <button onClick={() => setSelectedPeriod('6m')}>6 Month</button>
        <button onClick={() => setSelectedPeriod('ytd')}>YTD</button>
        <button onClick={() => setSelectedPeriod('1y')}>1 Year</button>
        <button onClick={() => setSelectedPeriod('5y')}>5 Year</button>
        <button onClick={() => setSelectedPeriod('all')}>All Time</button>
      </div>
      <div>
        <Line data={chartData} />
      </div>
      <div>
        {/* Financial Metrics - Example data, replace with real calculations */}
        <p><strong>52 Week Range:</strong> $120 - $180</p>
        <p><strong>Volume:</strong> 1,000,000</p>
      </div>
    </div>
  );
}

export default StockDetails;
