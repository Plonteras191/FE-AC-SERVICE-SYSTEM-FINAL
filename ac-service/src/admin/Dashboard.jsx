import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);

  // Fetch confirmed (accepted) appointments from the backend on component mount
  useEffect(() => {
    axios.get("http://localhost/AC-SERVICE-FINAL/backend/api/appointments.php")
      .then(response => {
        // Filter for appointments that are "Accepted"
        const confirmed = response.data.filter(
          appt => appt.status && appt.status.toLowerCase() === 'accepted'
        );
        setConfirmedAppointments(confirmed);
      })
      .catch(error => console.error("Error fetching appointments:", error));
  }, []);

  // Complete appointment by sending a PUT request to update its status to "Complete"
  const completeAppointment = (id) => {
    axios.put(`http://localhost/AC-SERVICE-FINAL/backend/api/appointments.php?complete&id=${id}`)
      .then(response => {
        const updatedAppointment = response.data;
        // Update the confirmedAppointments list with the updated appointment
        const updatedConfirmed = confirmedAppointments.map(app =>
          app.id === id ? updatedAppointment : app
        );
        setConfirmedAppointments(updatedConfirmed);
      })
      .catch(error => console.error("Error completing appointment:", error));
  };

  // Utility function to parse services JSON string (if needed)
  const parseServices = (servicesStr) => {
    try {
      const services = JSON.parse(servicesStr);
      return services.map(s => `${s.type} on ${s.date}`).join(', ');
    } catch (error) {
      return servicesStr;
    }
  };

  return (
    <PageWrapper>
      <div className="dashboard-main">
        <h1>Admin Dashboard</h1>
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
                    <th>Service(s)</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{appointment.name}</td>
                      <td>{appointment.phone}</td>
                      <td>{appointment.email}</td>
                      <td>
                        {appointment.services 
                          ? parseServices(appointment.services)
                          : 'N/A'}
                      </td>
                      <td>{appointment.complete_address}</td>
                      <td>{appointment.status || 'Pending'}</td>
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
