// src/components/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import '../styles/AdminReports.css';

const AdminReports = () => {
  const [appointments, setAppointments] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);

  useEffect(() => {
    // Fetch appointments (all)
    axios.get("http://localhost/AC-SERVICE-FINAL/backend/api/appointments.php")
      .then(response => {
        let data = response.data;
        if (!Array.isArray(data)) data = [data];
        setAppointments(data);
      })
      .catch(error => console.error("Error fetching appointments:", error));

    // Fetch revenue history from backend
    axios.get("http://localhost/AC-SERVICE-FINAL/backend/api/getRevenueHistory.php")
      .then(response => {
        setRevenueHistory(response.data);
      })
      .catch(error => console.error("Error fetching revenue history:", error));
  }, []);

  // Filter appointments based on status.
  const completeAppointments = appointments.filter(appt => 
    appt.status && appt.status.toLowerCase() === 'completed'
  );
  const pendingAppointments = appointments.filter(appt => 
    !appt.status || appt.status.toLowerCase() === 'pending'
  );
  
  // Group revenue history by month (e.g., "2025-04") and sum total revenue.
  const groupRevenueByMonth = (history) => {
    const groups = {};
    history.forEach(entry => {
      // Assume revenue_date is in 'YYYY-MM-DD' format; extract "YYYY-MM"
      const month = entry.revenue_date.substring(0, 7);
      if (!groups[month]) {
        groups[month] = 0;
      }
      groups[month] += parseFloat(entry.total_revenue);
    });
    // Convert the groups object into an array of { month, total } records
    return Object.entries(groups).map(([month, total]) => ({ month, total }));
  };

  const revenueByMonth = groupRevenueByMonth(revenueHistory);

  // Helper function to get appointment date.
  const getAppointmentDate = (appt) => {
    return appt.date || appt.complete_date || appt.created_at || 'N/A';
  };

  return (
    <div className="admin-reports-container">
      <h2>Admin Reports</h2>
      <div className="reports-grid">
        {/* Completed Appointments */}
        <div className="report-box complete">
          <h3><FaCheckCircle className="report-icon" /> Completed Appointments</h3>
          {completeAppointments.length > 0 ? (
            <ul>
              {completeAppointments.map(app => (
                <li key={app.id}>
                  <strong>ID:</strong> {app.id} - <strong>{app.name}</strong> <br />
                  <span className="date">Date: {getAppointmentDate(app)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No completed appointments.</p>
          )}
        </div>

        {/* Pending Appointments */}
        <div className="report-box pending">
          <h3><FaClock className="report-icon" /> Pending Appointments</h3>
          {pendingAppointments.length > 0 ? (
            <ul>
              {pendingAppointments.map(app => (
                <li key={app.id}>
                  <strong>ID:</strong> {app.id} - <strong>{app.name}</strong> <br />
                  <span className="date">Date: {getAppointmentDate(app)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending appointments.</p>
          )}
        </div>

        {/* Total Sales Each Month */}
        <div className="report-box revenue">
          <h3>Total Revenue Each Month</h3>
          {revenueByMonth.length > 0 ? (
            <table className="revenue-history-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Revenue (Php)</th>
                </tr>
              </thead>
              <tbody>
                {revenueByMonth.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.month}</td>
                    <td>{entry.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No revenue history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
