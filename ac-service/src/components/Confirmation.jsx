import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Confirmation.css';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};

  return (
    <div className="confirmation-container">
      <h2>Appointment Pending</h2>
      <p>Thank you for booking your appointment!</p>
      <p>Your appointment is currently pending. We will contact you shortly to confirm your details.</p>
      <div className="booking-details">
        <ul>
          <li>
            <strong>Date:</strong> {bookingData.date}
          </li>
          <li>
            <strong>Name:</strong> {bookingData.name}
          </li>
          <li>
            <strong>Phone:</strong> {bookingData.phone}
          </li>
          <li>
            <strong>Email:</strong> {bookingData.email}
          </li>
          {bookingData.completeAddress && (
            <li>
              <strong>Complete Address:</strong> {bookingData.completeAddress}
            </li>
          )}
          <li>
            <strong>Street:</strong> {bookingData.street}, <strong>House No:</strong> {bookingData.houseNo}, <strong>Apartment No:</strong> {bookingData.apartmentNo}
          </li>
          <li>
            <strong>Service:</strong> {bookingData.service}
          </li>
          {bookingData.acTypes && bookingData.acTypes.length > 0 && (
            <li>
              <strong>AC Type:</strong> {bookingData.acTypes.join(', ')}
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
