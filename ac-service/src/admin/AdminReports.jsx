import React from 'react';
import '../styles/AdminReports.css';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const AdminReports = () => {
  const completeAppointments = [
    { id: 3, customer: 'Edmar ArmStrong', date: '2025-04-03' },
    { id: 2, customer: 'Gabi Val', date: '2025-04-05' }
  ];
  const pendingAppointments = [
    { id: 1, customer: 'John Kristoffer', date: '2025-04-01' }
  ];
  const declinedAppointments = [
    { id: 4, customer: 'Just Buico', date: '2025-04-04' }
  ];

  return (
    <div className="admin-reports-container">
      <h2>Admin Reports</h2>
      <div className="reports-grid">
        
        {/* Completed Appointments */}
        <div className="report-box complete">
          <h3><FaCheckCircle className="report-icon" /> Completed Appointments</h3>
          <ul>
            {completeAppointments.map(app => (
              <li key={app.id}>
                <strong>ID:</strong> {app.id} - <strong>{app.customer}</strong> <br />
                <span className="date">Date: {app.date}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Appointments */}
        <div className="report-box pending">
          <h3><FaClock className="report-icon" /> Pending Appointments</h3>
          <ul>
            {pendingAppointments.map(app => (
              <li key={app.id}>
                <strong>ID:</strong> {app.id} - <strong>{app.customer}</strong> <br />
                <span className="date">Date: {app.date}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rejected Appointments */}
        <div className="report-box rejected">
          <h3><FaTimesCircle className="report-icon" /> Rejected Appointments</h3>
          <ul>
            {declinedAppointments.map(app => (
              <li key={app.id}>
                <strong>ID:</strong> {app.id} - <strong>{app.customer}</strong> <br />
                <span className="date">Date: {app.date}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
