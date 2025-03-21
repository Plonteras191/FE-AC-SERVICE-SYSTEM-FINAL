// src/admin/AdminBooking.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminBooking.css';

// Mapping of service keys to full service names
const serviceOptions = {
  maintenance: "Routine Maintenance and Cleaning",
  repair: "Repair",
  installation: "Installation",
};

// Mapping for aircon types (if you want to display full names, you can modify accordingly)
const airconOptions = {
  Central: "Central",
  Window: "Window",
  Split: "Split",
};

const AdminBooking = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAirconTypes, setSelectedAirconTypes] = useState([]);
  const navigate = useNavigate();

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedServices([...selectedServices, value]);
    } else {
      setSelectedServices(selectedServices.filter(service => service !== value));
    }
  };

  const handleAirconChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedAirconTypes([...selectedAirconTypes, value]);
    } else {
      setSelectedAirconTypes(selectedAirconTypes.filter(type => type !== value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a booking object
    const bookingData = {
      name,
      phone,
      address,
      // Map keys to full names for services
      services: selectedServices.map(service => serviceOptions[service]),
      airconTypes: selectedAirconTypes,
    };
    console.log("Admin Booking Data:", bookingData);
    alert("Booking submitted successfully!");
    // Optionally reset the form fields:
    setName('');
    setPhone('');
    setAddress('');
    setSelectedServices([]);
    setSelectedAirconTypes([]);
    // You can also navigate to a confirmation page if needed:
    // navigate('/admin/confirmation', { state: bookingData });
  };

  return (
    <div className="admin-booking-container">
      <h2>Admin Booking</h2>
      <form onSubmit={handleSubmit} className="admin-booking-form">
        <div className="form-group">
          <label htmlFor="adminName">Name:</label>
          <input
            type="text"
            id="adminName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminPhone">Phone Number:</label>
          <input
            type="tel"
            id="adminPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
            pattern="^[0-9]{11}$"
            title="Phone number must be exactly 11 digits."
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminAddress">Address:</label>
          <input
            type="text"
            id="adminAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter complete address"
            required
          />
        </div>
        <div className="form-group">
          <label>Type of Service (Select one or more):</label>
          <div className="checkbox-group">
            {Object.entries(serviceOptions).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  value={key}
                  checked={selectedServices.includes(key)}
                  onChange={handleServiceChange}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Type of Aircon (Select one or more):</label>
          <div className="checkbox-group">
            {Object.entries(airconOptions).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  value={key}
                  checked={selectedAirconTypes.includes(key)}
                  onChange={handleAirconChange}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="admin-booking-submit">Submit Booking</button>
      </form>
    </div>
  );
};

export default AdminBooking;
