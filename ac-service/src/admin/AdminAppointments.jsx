import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import '../styles/AdminAppointments.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleService, setRescheduleService] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/appointments")
      .then(response => setAppointments(response.data))
      .catch(error => console.error("Error fetching appointments:", error));
  }, []);

  const handleCancelAppointment = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/appointments/${id}`);
      setAppointments(appointments.filter(appt => appt.id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const openRejectModal = (id) => {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  };

  const handleConfirmReject = () => {
    handleCancelAppointment(selectedAppointmentId);
    setIsModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleRescheduleClick = (id, serviceName = null) => {
    setRescheduleId(id);
    setRescheduleService(serviceName);
  };

  const handleRescheduleConfirm = async (id) => {
    const payload = rescheduleService
      ? { service_name: rescheduleService, new_date: newDate }
      : { new_date: newDate };

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/appointments/${id}`, payload);
      setAppointments(appointments.map(appt => appt.id === id ? response.data : appt));
    } catch (error) {
      console.error("Error rescheduling:", error);
    }

    setRescheduleId(null);
    setRescheduleService(null);
    setNewDate("");
  };

  const handleRescheduleCancel = () => {
    setRescheduleId(null);
    setRescheduleService(null);
    setNewDate("");
  };

  const handleAcceptAppointment = async (id) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/appointments/${id}/accept`);
      setAppointments(appointments.map(appt => appt.id === id ? response.data : appt));
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
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
              <th>Service</th>
              <th>Address</th>
              <th>Date(s)</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.id}</td>
                <td>{appt.customer}</td>
                <td>{appt.phone}</td>
                <td>{appt.email}</td>
                <td>
                  {Array.isArray(appt.service)
                    ? appt.service.join(", ")
                    : appt.service}
                </td>
                <td>{appt.address}</td>
                <td>
                  {appt.service_dates ? (
                    <ul className="multi-date-list">
                      {Object.entries(appt.service_dates).map(([serviceName, date]) => (
                        <li key={serviceName}>
                          <strong>{serviceName}:</strong> {date}
                          {rescheduleId === appt.id && rescheduleService === serviceName ? (
                            <div className="reschedule-input-container">
                              <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="reschedule-date-input"
                              />
                              <button
                                className="confirm-button"
                                onClick={() => handleRescheduleConfirm(appt.id)}
                                disabled={!newDate}
                              >
                                Confirm
                              </button>
                              <button
                                className="cancel-button"
                                onClick={handleRescheduleCancel}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="reschedule-button"
                              onClick={() => handleRescheduleClick(appt.id, serviceName)}
                            >
                              Reschedule
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      {appt.date}
                      {rescheduleId === appt.id && (
                        <div className="reschedule-input-container">
                          <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="reschedule-date-input"
                          />
                          <button
                            className="confirm-button"
                            onClick={() => handleRescheduleConfirm(appt.id)}
                            disabled={!newDate}
                          >
                            Confirm
                          </button>
                          <button
                            className="cancel-button"
                            onClick={handleRescheduleCancel}
                          >
                            Cancel Reschedule
                          </button>
                        </div>
                      )}
                      {rescheduleId !== appt.id && (
                        <button
                          className="reschedule-button"
                          onClick={() => handleRescheduleClick(appt.id)}
                        >
                          Reschedule
                        </button>
                      )}
                    </>
                  )}
                </td>
                <td>{appt.time}</td>
                <td>{appt.status}</td>
                <td>
                  {rescheduleId === appt.id ? null : (
                    <>
                      <button
                        className="cancel-button"
                        onClick={() => openRejectModal(appt.id)}
                      >
                        Reject
                      </button>
                      <button
                        className="accept-button"
                        onClick={() => handleAcceptAppointment(appt.id)}
                      >
                        Accept
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isModalOpen}
        message="Are you sure you want to reject this appointment?"
        onConfirm={handleConfirmReject}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default AdminAppointments;
