import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import '../styles/AdminCalendar.css';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch service appointments from the backend endpoint
    axios.get("http://localhost/AC-SERVICE-FINAL/backend/api/getServiceAppointments.php")
      .then(response => {
        const appointments = response.data;
        // Map each appointment into a FullCalendar event
        const calendarEvents = appointments.map(appt => {
          // If time is available, combine date and time; otherwise, use date only.
          const start = appt.time && appt.time.trim() !== ""
            ? `${appt.date}T${convertTimeTo24(appt.time)}`
            : appt.date;
          return {
            id: `${appt.bookingId}-${appt.service}`, // ensure unique ID per event
            title: `${appt.service} (Booking ${appt.bookingId})`,
            start: start,
            allDay: !(appt.time && appt.time.trim() !== ""),
            extendedProps: { time: appt.time }
          };
        });
        setEvents(calendarEvents);
      })
      .catch(error => console.error("Error fetching service appointments:", error));
  }, []);

  // Utility function: convert 12-hour time (e.g., "02:00 PM") to 24-hour time (e.g., "14:00:00")
  const convertTimeTo24 = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  };

  return (
    <div className="admin-calendar-page">
      <h2>Admin Calendar</h2>
      <FullCalendar 
        plugins={[ dayGridPlugin ]}
        initialView="dayGridMonth"
        events={events}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        height="auto"
      />
    </div>
  );
};

export default AdminCalendar;