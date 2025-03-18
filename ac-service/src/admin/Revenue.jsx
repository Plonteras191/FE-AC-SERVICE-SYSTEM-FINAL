// src/components/Revenue.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Revenue.css';

const Revenue = () => {
  const [appointments, setAppointments] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  // On mount, load appointments from localStorage's "completedAppointments"
  useEffect(() => {
    const storedAppointments = localStorage.getItem('completedAppointments');
    if (storedAppointments) {
      const parsedAppointments = JSON.parse(storedAppointments);
      setAppointments(parsedAppointments);
    }
  }, []);

  const handleInputChange = (id, value) => {
    setRevenueData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  // Compute total revenue based on input values
  const computeTotalRevenue = () => {
    let total = 0;
    Object.values(revenueData).forEach(val => {
      const amount = parseFloat(val);
      if (!isNaN(amount)) {
        total += amount;
      }
    });
    setTotalRevenue(total);
  };

  // Save computed revenue to revenue history, clear revenue inputs,
  // and remove processed appointments from the Revenue page.
  const saveRevenue = () => {
    // Validate that every appointment has a revenue amount
    const missingInput = appointments.some(appt => {
      const value = revenueData[appt.id];
      return !value || value.toString().trim() === "";
    });

    if (missingInput) {
      alert("Please input revenue amount for all appointments before saving.");
      return;
    }

    // Create a new revenue record with the current date and computed total
    const newEntry = {
      date: new Date().toLocaleDateString(),
      total: totalRevenue,
    };

    // Save the new revenue record to localStorage under "revenueHistory"
    const storedHistory = localStorage.getItem('revenueHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.push(newEntry);
    localStorage.setItem('revenueHistory', JSON.stringify(history));

    // Clear revenue data for new entries and reset totalRevenue
    setRevenueData({});
    setTotalRevenue(0);

    // Remove the computed appointments from the Revenue page
    localStorage.removeItem('completedAppointments');
    setAppointments([]);
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
            Compute
          </button>
          <button className="save-button" onClick={saveRevenue}>
            Save
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
