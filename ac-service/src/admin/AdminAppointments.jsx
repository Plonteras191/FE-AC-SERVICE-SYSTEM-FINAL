import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminAppointments.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [rescheduleInputs, setRescheduleInputs] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const navigate = useNavigate();

  // Update endpoint URL based on your XAMPP folder structure
  const fetchUrl = "http://localhost/AC-SERVICE-FINAL/backend/api/appointments.php";

  useEffect(() => {
    // Fetch only pending appointments for admin view
    axios.get(fetchUrl)
      .then(response => {
        let data = response.data;
        if (!Array.isArray(data)) data = [data];
        // Filter to show only pending appointments
        const pending = data.filter(appt => !appt.status || appt.status.toLowerCase() === 'pending');
        setAppointments(pending);
      })
      .catch(error => console.error("Error fetching appointments:", error));
  }, [fetchUrl]);

  // Delete (reject) appointment
  const handleCancelAppointment = async (id) => {
    try {
      await axios.delete(`${fetchUrl}?id=${id}`);
      setAppointments(prev => prev.filter(appt => appt.id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // Open modal to confirm rejection
  const openRejectModal = (id) => {
    setSelectedAppointmentId(id);
    setIsConfirmModalOpen(true);
  };

  // Confirm rejection and delete appointment
  const handleConfirmReject = () => {
    handleCancelAppointment(selectedAppointmentId);
    setIsConfirmModalOpen(false);
    setSelectedAppointmentId(null);
    // Removed navigation call so it remains on the same page.
  };

  const handleCancelModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedAppointmentId(null);
  };

  // Toggle inline reschedule input for a given appointment service
  const toggleRescheduleInput = (appointmentId, serviceType) => {
    const key = `${appointmentId}-${serviceType}`;
    setRescheduleInputs(prev => {
      const newState = { ...prev };
      if (newState[key] !== undefined) {
        delete newState[key];
      } else {
        newState[key] = "";
      }
      return newState;
    });
  };

  // Handle change for inline reschedule input
  const handleRescheduleInputChange = (appointmentId, serviceType, value) => {
    const key = `${appointmentId}-${serviceType}`;
    setRescheduleInputs(prev => ({ ...prev, [key]: value }));
  };

  // Confirm reschedule for a specific service in an appointment
  const handleServiceRescheduleConfirm = async (appointmentId, serviceType) => {
    const key = `${appointmentId}-${serviceType}`;
    const newDate = rescheduleInputs[key];
    if (!newDate) return;
    const payload = { service_name: serviceType, new_date: newDate };
    try {
      const response = await axios.put(`${fetchUrl}?action=reschedule&id=${appointmentId}`, payload);
      if (response.data && !response.data.error) {
        setAppointments(prev =>
          prev.map(appt => (appt.id === appointmentId ? response.data : appt))
        );
        setRescheduleInputs(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      } else {
        console.error("Backend error:", response.data.error);
      }
    } catch (error) {
      console.error("Error rescheduling service:", error);
    }
  };

  // Cancel inline reschedule input for a specific service
  const handleRescheduleCancel = (appointmentId, serviceType) => {
    const key = `${appointmentId}-${serviceType}`;
    setRescheduleInputs(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  // Accept appointment by sending a POST request with action=accept.
  // Then, if an email exists, trigger an email notification.
  const handleAcceptAppointment = async (id) => {
    try {
      const response = await axios.post(`${fetchUrl}?action=accept&id=${id}`);
      if (
        response.data &&
        response.data.status &&
        response.data.status.toLowerCase() === 'accepted'
      ) {
        // If an email is provided, send email notification
        if (response.data.email) {
          await axios.post("http://localhost/AC-SERVICE-FINAL/backend/api/sendEmailNotification.php", {
            email: response.data.email,
            appointmentId: id,
            name: response.data.name,
            message: "Your appointment has been accepted."
          });
        }
        setAppointments(prev => prev.filter(appt => appt.id !== id));
      }
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  // Utility function to parse services JSON string
  const parseServices = (servicesStr) => {
    try {
      return JSON.parse(servicesStr);
    } catch (error) {
      return [];
    }
  };

  // Removed navigate() call in modal confirmation to remain on the page.
  const handleModalConfirm = () => {
    setIsConfirmModalOpen(false);
    // Instead of navigating away, you could show a success message.
    // If you want to navigate, update the destination route here.
  };

  return (
    <div className="admin-appointments-container">
      <h2>Admin Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments available.</p>
      ) : (
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const services = parseServices(appt.services);
              return (
                <tr key={appt.id}>
                  <td>{appt.id}</td>
                  <td>{appt.name}</td>
                  <td>{appt.phone}</td>
                  <td>{appt.email}</td>
                  <td>
                    {services.length > 0 ? (
                      services.map((s) => {
                        const key = `${appt.id}-${s.type}`;
                        return (
                          <div key={key}>
                            <span>{s.type} on {s.date}</span>
                            {rescheduleInputs[key] !== undefined ? (
                              <div className="reschedule-input-container">
                                <input
                                  type="date"
                                  value={rescheduleInputs[key]}
                                  onChange={(e) =>
                                    handleRescheduleInputChange(appt.id, s.type, e.target.value)
                                  }
                                  className="reschedule-date-input"
                                />
                                <button
                                  className="confirm-button"
                                  onClick={() => handleServiceRescheduleConfirm(appt.id, s.type)}
                                  disabled={!rescheduleInputs[key]}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="cancel-button"
                                  onClick={() => handleRescheduleCancel(appt.id, s.type)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="reschedule-button"
                                onClick={() => toggleRescheduleInput(appt.id, s.type)}
                              >
                                Reschedule
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{appt.complete_address}</td>
                  <td>{appt.status || 'Pending'}</td>
                  <td>
                    <button className="reject-button" onClick={() => openRejectModal(appt.id)}>
                      Reject
                    </button>
                    <button className="accept-button" onClick={() => handleAcceptAppointment(appt.id)}>
                      Accept
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <Modal
        isOpen={isConfirmModalOpen}
        title="Confirm Rejection"
        message="Are you sure you want to reject this appointment?"
        onConfirm={handleConfirmReject}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default AdminAppointments;
