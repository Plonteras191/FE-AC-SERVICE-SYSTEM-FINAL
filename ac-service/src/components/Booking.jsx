import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/Booking.css';

const Booking = () => {
  const [service, setService] = useState('');
  const [acTypes, setAcTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  // Sample available dates for demonstration purposes
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
    setService(e.target.value);
    setAcTypes([]); // Reset AC types when service changes
  };

  const handleACTypeChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      if (!acTypes.includes(value)) {
        setAcTypes([...acTypes, value]);
      }
    } else {
      setAcTypes(acTypes.filter((type) => type !== value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      service,
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
            <input type="text" id="name" name="name" placeholder="Your Name" required />

            <label htmlFor="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" placeholder="Your Phone Number" required />

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

          {/* Service Section */}
          <div className="service-section">
            <h3>Service</h3>
            <select value={service} onChange={handleServiceChange} required>
              <option value="">Select Service</option>
              <option value="maintenance">Routine Maintenance and Cleaning</option>
              <option value="repair">Repair</option>
              <option value="installation">Installation</option>
            </select>
          </div>

          {/* AC Type Section */}
          {service && (
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
