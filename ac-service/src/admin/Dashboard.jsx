import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState(() => {
    const stored = localStorage.getItem('confirmedAppointments');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('confirmedAppointments', JSON.stringify(confirmedAppointments));
  }, [confirmedAppointments]);

  const completeAppointment = (id) => {
    const appointmentToComplete = confirmedAppointments.find(app => app.id === id);
    if (appointmentToComplete) {
      const updatedConfirmed = confirmedAppointments.filter(app => app.id !== id);
      setConfirmedAppointments(updatedConfirmed);

      const completedAppointment = { ...appointmentToComplete, status: 'Complete', sales: '' };

      const storedCompleted = localStorage.getItem('completedAppointments');
      const completedAppointments = storedCompleted ? JSON.parse(storedCompleted) : [];
      const newCompleted = [...completedAppointments, completedAppointment];
      localStorage.setItem('completedAppointments', JSON.stringify(newCompleted));
    }
  };

  return (
    <PageWrapper>
      <div className="dashboard-main">
        <h2>Admin Dashboard</h2>
      

        <div className="dashboard-section">
          <h3>Confirmed Appointments</h3>
          <div className="appointment-box">
            {confirmedAppointments.length > 0 ? (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{appointment.customer}</td>
                      <td>{appointment.phone}</td>
                      <td>{appointment.email}</td>
                      <td>{appointment.service}</td>
                      <td>{appointment.address}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.status}</td>
                      <td>
                        <button
                          className="complete-button"
                          onClick={() => completeAppointment(appointment.id)}
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No confirmed appointments.</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
