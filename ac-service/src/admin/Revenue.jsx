// src/components/Revenue.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Revenue.css';

const Revenue = () => {
  const [appointments, setAppointments] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  // On mount, load completed appointments from localStorage's "completedAppointments"
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

  // Save computed revenue to revenue history via the backend API,
  // then clear localStorage and reset the component state without navigating away.
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
      revenue_date: new Date().toISOString().slice(0, 10), // Format: 'YYYY-MM-DD'
      total_revenue: totalRevenue,
    };

    // POST the new revenue record to the backend API endpoint
    fetch("http://localhost/AC-SERVICE-FINAL/backend/api/saveRevenueHistory.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.id) {
          
          // Clear localStorage for completed appointments and reset component state
          localStorage.removeItem('completedAppointments');
          setAppointments([]);
          setRevenueData({});
          setTotalRevenue(0);
        } else {
          alert("Error saving revenue: " + (responseData.error || "Unknown error."));
        }
      })
      .catch(error => {
        console.error("Error saving revenue:", error);
        alert("Error saving revenue. Please try again.");
      });
  };

  // Helper function: extract service info from the services JSON string.
  // Combines all service types and dates.
  const getServiceInfo = (servicesStr) => {
    if (!servicesStr) return { service: "N/A", date: "N/A" };
    try {
      const services = JSON.parse(servicesStr);
      if (services.length > 0) {
        const serviceNames = services.map(s => s.type).join(', ');
        const serviceDates = services.map(s => s.date).join(', ');
        return { service: serviceNames, date: serviceDates };
      }
    } catch (error) {
      console.error("Error parsing services:", error);
    }
    return { service: "N/A", date: "N/A" };
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
              {appointments.map(appt => {
                const { service, date } = getServiceInfo(appt.services);
                return (
                  <tr key={appt.id}>
                    <td>{appt.id}</td>
                    <td>{appt.customer || appt.name}</td>
                    <td>{service}</td>
                    <td>{date}</td>
                    <td>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={revenueData[appt.id] || ''}
                        onChange={(e) => handleInputChange(appt.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
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
