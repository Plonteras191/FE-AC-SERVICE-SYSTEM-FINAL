import React, { useState } from 'react';
import '../styles/AdminCalendar.css';

const AdminCalendar = () => {
  const year = 2025;
  const month = 3; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const appointments = [
    { id: 1, customer: "John Kristoffer", service: "Repair", date: "2025-04-05", time: "10:00 AM", status: "Pending" },
    { id: 2, customer: "Edmar ArmsStrong", service: "Installation", date: "2025-04-12", time: "02:00 PM", status: "Confirmed" },
    { id: 3, customer: "Just Buico", service: "Maintenance, Repair", date: "2025-04-12", time: "09:00 AM", status: "Pending" },
    { id: 4, customer: "Gabi Val", service: "Repair, Installation", date: "2025-04-20", time: "11:00 AM", status: "Pending" },
  ];

  const [selectedDay, setSelectedDay] = useState(null);

  const formatDate = (day) => {
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (month + 1).toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const appointmentsForDay = selectedDay
    ? appointments.filter(appt => appt.date === formatDate(selectedDay))
    : [];

  return (
    <div className="admin-calendar-page">
      <h2>Admin Calendar</h2>
      
      

      
      {!selectedDay && (
        <div className="calendar-container">
          <div className="big-calendar">
            <h3>Big Calendar</h3>
            <div className="calendar-grid">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDate(day);
                const hasAppointment = appointments.some(appt => appt.date === dateStr);
                return (
                  <div
                    key={i}
                    className={`calendar-cell ${hasAppointment ? 'has-appointment' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="available-dates-box">
            <h3>Days with Appointments</h3>
            <ul>
              {appointments.map((appt, index) => (
                <li key={index}>{appt.date}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      
      {selectedDay && (
        <div className="appointment-details">
          <h3>Appointments for {formatDate(selectedDay)}</h3>
          {appointmentsForDay.length === 0 ? (
            <p>No appointments for this day.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsForDay.map(appt => (
                  <tr key={appt.id}>
                    <td>{appt.id}</td>
                    <td>{appt.customer}</td>
                    <td>{appt.service}</td>
                    <td>{appt.time}</td>
                    <td>{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className="back-to-calendar" onClick={() => setSelectedDay(null)}>
            Back to Calendar
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
