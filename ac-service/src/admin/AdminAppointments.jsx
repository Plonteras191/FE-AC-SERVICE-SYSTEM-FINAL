import React, { useState, useEffect } from 'react';
import '../styles/AdminAppointments.css';

const AdminAppointments = () => {
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
      service: 'Installation, Maintenance',
      date: '2025-04-02',
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

  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleCancelAppointment = (id) => {
    setAppointments(appointments.filter(appt => appt.id !== id));
  };

  const handleRescheduleClick = (id) => {
    setRescheduleId(id);
  };

  const handleRescheduleConfirm = (id) => {
    setAppointments(
      appointments.map(appt =>
        appt.id === id ? { ...appt, date: newDate } : appt
      )
    );
    setRescheduleId(null);
    setNewDate('');
  };

  const handleRescheduleCancel = () => {
    setRescheduleId(null);
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
              <th>Date</th>
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
                <td>{appt.service}</td>
                <td>{appt.address}</td>
                <td>
                  {appt.date}
                  {rescheduleId === appt.id && (
                    <div className="reschedule-input-container">
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="reschedule-date-input"
                      />
                    </div>
                  )}
                </td>
                <td>{appt.time}</td>
                <td>{appt.status}</td>
                <td>
                  {rescheduleId === appt.id ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelAppointment(appt.id)}
                      >
                        Reject
                      </button>
                      <button
                        className="reschedule-button"
                        onClick={() => handleRescheduleClick(appt.id)}
                      >
                        Reschedule
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
    </div>
  );
};

export default AdminAppointments;
