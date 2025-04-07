import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [acceptedAppointments, setAcceptedAppointments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost/AC-SERVICE-FINAL/backend/api/appointments.php")
      .then(response => {
        let data = response.data;
        if (!Array.isArray(data)) data = [data];
        // Show only appointments with status "accepted" (pending for completion)
        const accepted = data.filter(appt => 
          appt.status && appt.status.toLowerCase() === 'accepted'
        );
        setAcceptedAppointments(accepted);
      })
      .catch(error => console.error("Error fetching appointments:", error));
  }, []);

  // Complete appointment: update its status to "Completed"
  const completeAppointment = (id) => {
    axios.post(`http://localhost/AC-SERVICE-FINAL/backend/api/appointments.php?action=complete&id=${id}`)
      .then(response => {
        const updatedAppointment = response.data;
        // Store the completed appointment in localStorage for later processing
        const stored = localStorage.getItem('completedAppointments');
        const completedAppointments = stored ? JSON.parse(stored) : [];
        completedAppointments.push(updatedAppointment);
        localStorage.setItem('completedAppointments', JSON.stringify(completedAppointments));

        // Remove the appointment from the Dashboard list
        const updatedAccepted = acceptedAppointments.filter(app => app.id !== id);
        setAcceptedAppointments(updatedAccepted);
      })
      .catch(error => console.error("Error completing appointment:", error));
  };

  // Utility function to parse services JSON string with numbering
  const parseServices = (servicesStr) => {
    try {
      const services = JSON.parse(servicesStr);
      return services.map((s, index) => `${index + 1}. ${s.type} on ${s.date}`).join(', ');
    } catch (error) {
      console.error("Error parsing services:", error);
      return 'N/A';
    }
  };

  // Function to display AC types with numbering
  const renderAcTypes = (acTypes) => {
    if (!acTypes || acTypes.length === 0) return 'N/A';
    return acTypes.map((ac, index) => `${index + 1}. ${ac}`).join(', ');
  };

  return (
    <PageWrapper>
      <div className="dashboard-main">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-section">
          <div className="appointment-box">
            {acceptedAppointments.length > 0 ? (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Service(s)</th>
                    <th>AC Type(s)</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{appointment.name}</td>
                      <td>{appointment.phone}</td>
                      <td>{appointment.email || 'N/A'}</td>
                      <td>
                        {appointment.services 
                          ? parseServices(appointment.services)
                          : 'N/A'}
                      </td>
                      <td>{renderAcTypes(appointment.ac_types)}</td>
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
              <p>No accepted appointments available.</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
