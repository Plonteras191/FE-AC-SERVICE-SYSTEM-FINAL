import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/Booking.css';

// Mapping of service keys to full service names
const serviceOptions = {
  maintenance: "Routine Maintenance and Cleaning",
  repair: "Repair",
  installation: "Installation",
};

const Booking = () => {
  const [selectedServices, setSelectedServices] = useState([]); // for multiple service selection
  const [acTypes, setAcTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  // Sample available dates
  const availableDates = [
    new Date('2025-04-01'),
    new Date('2025-04-02'),
    new Date('2025-04-03'),
    new Date('2025-04-04'),
    new Date('2025-04-05'),
    new Date('2025-04-12'),
    new Date('2025-04-15'),
    new Date('2025-04-09'),
    new Date('2025-04-20'),
  ];

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedServices([...selectedServices, value]);
    } else {
      setSelectedServices(selectedServices.filter(service => service !== value));
    }
  };

  const handleACTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAcTypes([...acTypes, value]);
    } else {
      setAcTypes(acTypes.filter(type => type !== value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    const formData = new FormData(e.target);
    const dateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : '';
    const data = {
      date: dateStr,
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      completeAddress: formData.get('completeAddress'),
      street: formData.get('street'),
      houseNo: formData.get('houseNo'),
      apartmentNo: formData.get('apartmentNo'),
      // Store full service names
      services: selectedServices.map(service => serviceOptions[service]),
      acTypes,
    };
    console.log(data);
    navigate('/confirmation', { state: data });
  };

  return (
    <div className="booking-container">
      <h2>Book Your Appointment</h2>
      <div className="booking-box">
        <form onSubmit={handleSubmit}>
          {/* Date Section with Calendar */}
          <div className="date-section">
            <label htmlFor="date">Select Date:</label>
            <DatePicker
              id="date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              includeDates={availableDates}
              placeholderText="Select an available date"
              required
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Customer Details Section */}
          <div className="customer-details">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your Name"
              required
              pattern="[A-Za-z ]+"
              title="Name should contain only letters and spaces."
            />

            <label htmlFor="phone">Phone Number:</label>
            <input
             type="tel"
             id="phone"
             name="phone"
              placeholder="Your Phone Number"
              required
               pattern="^[0-9]{11}$"
                title="Phone number must be exactly 11 digits."
                />


            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="Your Email" required />
          </div>

          {/* Address Section */}
          <div className="address-section">
            <h3>Address</h3>
            <div className="complete-address">
              <input
                type="text"
                id="completeAddress"
                name="completeAddress"
                placeholder="Enter complete address"
              />
            </div>
            <div className="address-inputs">
              <input type="text" name="street" placeholder="Street" required />
              <input type="text" name="houseNo" placeholder="House No" />
              <input type="text" name="apartmentNo" placeholder="Apartment No" />
            </div>
          </div>

          {/* Service Section (Multiple Choices) */}
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
          </div>

          {/* AC Type Section */}
          {selectedServices.length > 0 && (
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
                    value="Window"
                    checked={acTypes.includes("Window")}
                    onChange={handleACTypeChange}
                  />
                  Window Type
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Split"
                    checked={acTypes.includes("Split")}
                    onChange={handleACTypeChange}
                  />
                  Split Type
                </label>
              </div>
            </div>
          )}

          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
