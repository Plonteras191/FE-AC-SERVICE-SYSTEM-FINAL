// src/pages/AdminBooking.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Modal from '../components/Modal';
import '../styles/Booking.css';

const serviceOptions = {
  cleaning: "Cleaning",
  repair: "Repair",
  installation: "Installation",
};

const AdminBooking = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDates, setServiceDates] = useState({}); // Stores a date for each service
  const [acTypes, setAcTypes] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedServices(prev => [...prev, value]);
      setServiceDates(prev => ({ ...prev, [value]: null }));
    } else {
      setSelectedServices(prev => prev.filter(service => service !== value));
      setServiceDates(prev => {
        const newDates = { ...prev };
        delete newDates[value];
        return newDates;
      });
    }
  };

  const handleACTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAcTypes(prev => [...prev, value]);
    } else {
      setAcTypes(prev => prev.filter(type => type !== value));
    }
  };

  const handleServiceDateChange = (service, date) => {
    setServiceDates(prev => ({ ...prev, [service]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that a date is selected for each chosen service
    for (const service of selectedServices) {
      if (!serviceDates[service]) {
        alert(`Please select a date for ${serviceOptions[service]}.`);
        return;
      }
    }

    const formData = new FormData(e.target);
    const bookingData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      completeAddress: formData.get('completeAddress'),
      street: formData.get('street'),
      houseNo: formData.get('houseNo'),
      apartmentNo: formData.get('apartmentNo'),
      services: selectedServices.map(service => ({
        type: serviceOptions[service],
        date: serviceDates[service] ? serviceDates[service].toISOString().slice(0, 10) : null,
      })),
      acTypes,
    };

    fetch("http://localhost/AC-SERVICE-FINAL/backend/api/booking.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
      .then(response => response.json())
      .then(responseData => {
        console.log("Response from backend:", responseData);
        if (responseData.bookingId) {
          // Open the confirmation modal on success
          setIsConfirmModalOpen(true);
        } else {
          alert("Error saving booking: " + responseData.message);
        }
      })
      .catch(error => {
        console.error("Error saving booking:", error);
      });
  };

  // Modal confirmation: when admin confirms, navigate to admin dashboard (adjust path as needed)
  const handleModalConfirm = () => {
    setIsConfirmModalOpen(false);
    navigate('/admin/dashboard');
  };

  // If the admin cancels the confirmation, just close the modal (stay on current page)
  const handleModalCancel = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="booking-container">
      <h2>Admin Booking</h2>
      <div className="booking-box">
        <form onSubmit={handleSubmit}>
          {/* Customer Details Section */}
          <div className="customer-details">
            <label htmlFor="name">Name (required):</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Customer Name"
              required
              pattern="[A-Za-z ]+"
              title="Name should contain only letters and spaces."
            />

            <label htmlFor="phone">Phone Number (required):</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Customer Phone"
              required
              pattern="^[0-9]{11}$"
              title="Phone number must be exactly 11 digits."
            />

            <label htmlFor="email">Email (optional):</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Customer Email"
            />
          </div>

          {/* Address Section */}
          <div className="address-section">
            <h3>Address (required)</h3>
            <div className="complete-address">
              <input
                type="text"
                id="completeAddress"
                name="completeAddress"
                placeholder="Enter complete address"
                required
              />
            </div>
            <div className="address-inputs">
              <input type="text" name="street" placeholder="Street" required />
              <input type="text" name="houseNo" placeholder="House No" />
              <input type="text" name="apartmentNo" placeholder="Apartment No" />
            </div>
          </div>

          {/* Service Section */}
          <div className="service-section">
            <h3>Service (Select one or more)</h3>
            <div className="service-options">
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
            {/* Date pickers for each selected service */}
            {selectedServices.length > 0 && (
              <div className="service-dates">
                {selectedServices.map(service => (
                  <div key={service} className="service-date-picker">
                    <label>Select date for {serviceOptions[service]}:</label>
                    <DatePicker
                      selected={serviceDates[service]}
                      onChange={(date) => handleServiceDateChange(service, date)}
                      minDate={new Date()} // Allow only current and future dates
                      placeholderText="Select a date"
                      required
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AC Type Section */}
          <div className="ac-type-section">
            <h3>AC Type (Select all that apply)</h3>
            <div className="ac-type-options">
              <label>
                <input
                  type="checkbox"
                  value="Central"
                  checked={acTypes.includes("Central")}
                  onChange={handleACTypeChange}
                />
                Central
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Windows"
                  checked={acTypes.includes("Windows")}
                  onChange={handleACTypeChange}
                />
                Windows
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Split"
                  checked={acTypes.includes("Split")}
                  onChange={handleACTypeChange}
                />
                Split
              </label>
            </div>
          </div>

          <button type="submit">Book Appointment</button>
        </form>
      </div>
      <Modal
        isOpen={isConfirmModalOpen}
        title="Booking Confirmed"
        message="The booking has been successfully saved."
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default AdminBooking;
