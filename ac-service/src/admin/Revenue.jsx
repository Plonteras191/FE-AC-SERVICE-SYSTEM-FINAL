// src/components/Revenue.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Revenue.css';

const Revenue = () => {
  const [appointments, setAppointments] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  
  useEffect(() => {
    loadCompletedAppointments();
  }, []);

  const loadCompletedAppointments = () => {
    const storedAppointments = localStorage.getItem('completedAppointments');
    if (storedAppointments) {
      const parsedAppointments = JSON.parse(storedAppointments);
      setAppointments(parsedAppointments);
    }
  };

  const handleInputChange = (id, value) => {
    setRevenueData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const computeTotalRevenue = () => {
    let total = 0;
    Object.values(revenueData).forEach(val => {
      const amount = parseFloat(val);
      if (!isNaN(amount)) {
        total += amount;
      }
    });
    setTotalRevenue(total);

    
    const newEntry = {
      date: new Date().toLocaleDateString(),
      total: total,
    };

   
    const storedHistory = localStorage.getItem('revenueHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.push(newEntry);
    localStorage.setItem('revenueHistory', JSON.stringify(history));
  };

 
  const clearCompletedAppointments = () => {
    localStorage.removeItem('completedAppointments');
    setAppointments([]);
    setRevenueData({});
    setTotalRevenue(0);
  };

  return (
    <div className="revenue-container">
      <h2>Revenue</h2>
      <div className="revenue-box">
        {appointments.length === 0 ? (
          <p>No completed appointments available.</p>
        ) : (
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Revenue (Php)</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td>{appt.id}</td>
                  <td>{appt.customer}</td>
                  <td>{appt.service}</td>
                  <td>{appt.date}</td>
                  <td>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={revenueData[appt.id] || ''}
                      onChange={(e) => handleInputChange(appt.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="revenue-actions">
          <button className="compute-button" onClick={computeTotalRevenue}>
            Compute Total Revenue
          </button>
          <button className="clear-button" onClick={clearCompletedAppointments}>
            Clear
          </button>
          <div className="total-display">
            <h3>Total Revenue: Php {totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
