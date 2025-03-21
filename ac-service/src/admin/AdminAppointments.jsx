// src/admin/AdminAppointments.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import '../styles/AdminAppointments.css';

const AdminAppointments = () => {
  // Updated initialAppointments: appointment id 2 now has multiple services with separate dates.
  const initialAppointments = [
    {
      id: 1,
      customer: 'John Kristoffer',
      phone: '092-682-25122',
      email: 'john@gmail.com',
      service: 'Repair',
      date: '2025-04-01',
      time: '10:00 AM',
      address: '123 Main St, Bugo, CDO',
      status: 'Pending',
    },
    {
      id: 2,
      customer: 'Just Buico',
      phone: '095-104-38982',
      email: 'just@gmail.com',
      service: ['Installation', 'Maintenance'], // multiple services
      serviceDates: { 
        Installation: '2025-04-02', 
        Maintenance: '2025-04-03' 
      },
      time: '02:00 PM',
      address: '456 Elm St, Zone 6, CDO',
      status: 'Pending',
    },
  ];

  const [appointments, setAppointments] = useState(() => {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length === 0) {
        localStorage.setItem('appointments', JSON.stringify(initialAppointments));
        return initialAppointments;
      }
      return parsed;
    }
    return initialAppointments;
  });

  // For rescheduling, we now also track which service is being rescheduled (if applicable)
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleService, setRescheduleService] = useState(null);
  const [newDate, setNewDate] = useState('');

  // State for modal (reject confirmation)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleCancelAppointment = (id) => {
    setAppointments(appointments.filter(appt => appt.id !== id));
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

  // For rescheduling a specific service's date or a single-date appointment
  const handleRescheduleClick = (id, serviceName = null) => {
    setRescheduleId(id);
    setRescheduleService(serviceName); // if null, then appointment has a single date
  };

  const handleRescheduleConfirm = (id) => {
    setAppointments(appointments.map(appt => {
      if (appt.id === id) {
        if (appt.serviceDates && rescheduleService) {
          // Update only the specific service's date
          return {
            ...appt,
            serviceDates: {
              ...appt.serviceDates,
              [rescheduleService]: newDate
            }
          };
        } else {
          // For single date appointments
          return { ...appt, date: newDate };
        }
      }
      return appt;
    }));
    setRescheduleId(null);
    setRescheduleService(null);
    setNewDate('');
  };

  const handleRescheduleCancel = () => {
    setRescheduleId(null);
    setRescheduleService(null);
    setNewDate('');
  };

  const handleAcceptAppointment = (id) => {
    const appointmentToAccept = appointments.find(appt => appt.id === id);
    if (!appointmentToAccept) return;

    const acceptedAppointment = { ...appointmentToAccept, status: 'Confirmed' };
    const updatedPending = appointments.filter(appt => appt.id !== id);
    setAppointments(updatedPending);

    const storedConfirmed = localStorage.getItem('confirmedAppointments');
    const confirmedAppointments = storedConfirmed ? JSON.parse(storedConfirmed) : [];
    const updatedConfirmed = [...confirmedAppointments, acceptedAppointment];
    localStorage.setItem('confirmedAppointments', JSON.stringify(updatedConfirmed));
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
                    ? appt.service.join(', ')
                    : appt.service}
                </td>
                <td>{appt.address}</td>
                <td>
                  {appt.serviceDates ? (
                    <ul className="multi-date-list">
                      {Object.entries(appt.serviceDates).map(([serviceName, date]) => (
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
