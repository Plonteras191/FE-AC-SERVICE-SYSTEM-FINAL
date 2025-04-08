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

  // Utility function to parse services JSON string
  const parseServices = (servicesStr) => {
    try {
      return JSON.parse(servicesStr);
    } catch (error) {
      console.error("Error parsing services:", error);
      return [];
    }
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
                    <th>Service Details</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedAppointments.map((appointment) => {
                    const services = parseServices(appointment.services);
                    return (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>{appointment.name}</td>
                        <td>{appointment.phone}</td>
                        <td>{appointment.email || 'N/A'}</td>
                        <td>
                          {services.length > 0 ? (
                            <div className="service-details">
                              {services.map((s, index) => (
                                <div key={`${appointment.id}-${index}`} className="service-item">
                                  <div className="service-info">
                                    <strong>{index + 1}. {s.type}</strong> on {s.date}
                                    {s.acTypes && s.acTypes.length > 0 && (
                                      <div className="ac-types">
                                        <em>AC Types:</em> {s.acTypes.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            'N/A'
                          )}
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
                    );
                  })}
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