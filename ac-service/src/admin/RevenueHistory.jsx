// src/components/RevenueHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RevenueHistory.css';

const RevenueHistory = () => {
  const [history, setHistory] = useState([]);

  // Load revenue history from the backend API on component mount
  useEffect(() => {
    axios.get("http://localhost/AC-SERVICE-FINAL/backend/api/getRevenueHistory.php")
      .then(response => {
        setHistory(response.data);
      })
      .catch(error => {
        console.error("Error fetching revenue history:", error);
        setHistory([]);
      });
  }, []);

  return (
    <div className="revenue-history-container">
      <h2>Revenue History</h2>
      <div className="revenue-history-box">
        {history.length === 0 ? (
          <p>No revenue history available.</p>
        ) : (
          <table className="revenue-history-table">
            <thead>
              <tr>
                <th>Date Recorded</th>
                <th>Total Revenue (Php)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.revenue_date}</td>
                  <td>{parseFloat(entry.total_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RevenueHistory;
