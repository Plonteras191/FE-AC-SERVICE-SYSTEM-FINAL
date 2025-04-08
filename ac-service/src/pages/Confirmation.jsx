import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Confirmation.css';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};

  // Convert the services array of objects into a string representation
  const servicesDisplay = bookingData.services && bookingData.services.length > 0
    ? bookingData.services
        .map(service => `${service.type} on ${service.date}`)
        .join(', ')
    : "None selected";

  return (
    <div className="confirmation-container">
      <h2>Appointment Pending</h2>
      <p>Thank you for booking your appointment!</p>
      <p>Your appointment is currently pending. We will contact you shortly to confirm your details.</p>
      <div className="booking-details">
        <ul>
          <li><strong>Name:</strong> {bookingData.name}</li>
          <li><strong>Phone:</strong> {bookingData.phone}</li>
          <li><strong>Email:</strong> {bookingData.email}</li>
          {bookingData.completeAddress && (
            <li><strong>Complete Address:</strong> {bookingData.completeAddress}</li>
          )}
          <li>
            <strong>Service(s):</strong> {servicesDisplay}
          </li>
          {bookingData.acTypes && bookingData.acTypes.length > 0 && (
            <li>
              <strong>AC Type(s):</strong> {bookingData.acTypes.join(', ')}
            </li>
          )}
        </ul>
      </div>
      <button className="home-button" onClick={() => navigate('/')}>
        Go to Home
      </button>
    </div>
  );
};

export default Confirmation;
