import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { parseISO, format } from 'date-fns';
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
  const [serviceDates, setServiceDates] = useState({});
  const [globalAvailableDates, setGlobalAvailableDates] = useState([]);
  const [acTypes, setAcTypes] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  useEffect(() => {
    fetch("http://localhost/AC-SERVICE-FINAL/backend/api/getAvailableDates.php?global=1&start=2025-01-01&end=2025-12-31")
      .then(response => response.json())
      .then(data => {
        const dates = data.map(dateStr => parseISO(dateStr));
        setGlobalAvailableDates(dates);
      })
      .catch(err => console.error("Error fetching available dates:", err));
  }, []);

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

  const isDateGloballyAvailable = (date) => {
    if (globalAvailableDates.length === 0) return true;
    return globalAvailableDates.some(avDate =>
      avDate.toDateString() === date.toDateString()
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const service of selectedServices) {
      const selectedDate = serviceDates[service];
      if (!selectedDate) {
        alert(`Please select a date for ${serviceOptions[service]}.`);
        return;
      }
      if (!isDateGloballyAvailable(selectedDate)) {
        alert(`The selected date for ${serviceOptions[service]} is no longer available. Please select another date.`);
        return;
      }
    }

    const formData = new FormData(e.target);
    const bookingData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      completeAddress: formData.get('completeAddress'),
      services: selectedServices.map(service => ({
        type: serviceOptions[service],
        date: serviceDates[service] ? format(serviceDates[service], 'yyyy-MM-dd') : null,
      })),
      acTypes,
    };

    fetch("http://localhost/AC-SERVICE-FINAL/backend/api/booking.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    })
      .then(response => response.json())
      .then(responseData => {
        console.log("Response from backend:", responseData);
        if (responseData.bookingId) {
          // Set the booking reference ID and open the confirmation modal
          setBookingRef(responseData.bookingId);
          setIsConfirmModalOpen(true);
          
          // Reset form after successful submission
          resetForm();
        } else {
          alert("Error saving booking: " + responseData.message);
        }
      })
      .catch(error => {
        console.error("Error saving booking:", error);
      });
  };

  // Reset form to initial state
  const resetForm = () => {
    setSelectedServices([]);
    setServiceDates({});
    setAcTypes([]);
    // Reset the form element
    document.getElementById("adminBookingForm").reset();
  };

  // Close the modal without navigation
  const handleModalClose = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="booking-container admin-booking">
      <h2>Admin Booking</h2>
      <div className="booking-box">
        <form id="adminBookingForm" onSubmit={handleSubmit}>
          <div className="form-section customer-details">
            <h3>Customer Information</h3>
            <div className="input-group">
              <label htmlFor="name">Customer Name<span className="required">*</span></label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Enter customer name" 
                required 
                pattern="[A-Za-z ]+" 
                title="Name should contain only letters and spaces." 
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="phone">Phone Number<span className="required">*</span></label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="Enter 11-digit phone number" 
                required 
                pattern="^[0-9]{11}$" 
                title="Phone number must be exactly 11 digits." 
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter customer email (optional)" 
              />
            </div>
          </div>

          <div className="form-section address-section">
            <h3>Service Location</h3>
            <div className="input-group">
              <label htmlFor="completeAddress">Complete Address<span className="required">*</span></label>
              <input 
                type="text" 
                id="completeAddress" 
                name="completeAddress" 
                placeholder="Enter customer's complete address" 
                required 
              />
            </div>
          </div>

          <div className="form-section service-section">
            <h3>Service Selection</h3>
            <p className="section-hint">Select one or more services to book</p>
            <div className="service-options">
              {Object.entries(serviceOptions).map(([key, label]) => (
                <label key={key} className="checkbox-container">
                  <input 
                    type="checkbox" 
                    value={key} 
                    checked={selectedServices.includes(key)} 
                    onChange={handleServiceChange} 
                  />
                  <span className="checkbox-label">{label}</span>
                </label>
              ))}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="service-dates">
                {selectedServices.map(service => (
                  <div key={service} className="date-picker-group">
                    <label>Date for {serviceOptions[service]}<span className="required">*</span></label>
                    <DatePicker
                      selected={serviceDates[service]}
                      onChange={(date) => handleServiceDateChange(service, date)}
                      minDate={new Date()}
                      filterDate={isDateGloballyAvailable}
                      placeholderText="Select available date"
                      required
                      dateFormat="yyyy-MM-dd"
                      calendarClassName="custom-calendar"
                      className="date-input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section ac-type-section">
            <h3>AC Type Information</h3>
            <p className="section-hint">Select all AC types that apply to this service</p>
            <div className="ac-type-options">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  value="Central" 
                  checked={acTypes.includes("Central")} 
                  onChange={handleACTypeChange} 
                />
                <span className="checkbox-label">Central</span>
              </label>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  value="Windows" 
                  checked={acTypes.includes("Windows")} 
                  onChange={handleACTypeChange} 
                />
                <span className="checkbox-label">Windows</span>
              </label>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  value="Split" 
                  checked={acTypes.includes("Split")} 
                  onChange={handleACTypeChange} 
                />
                <span className="checkbox-label">Split</span>
              </label>
            </div>
          </div>

          <div className="form-submit">
            <button type="submit">Create Booking</button>
          </div>
        </form>
      </div>
      
      <Modal
        isOpen={isConfirmModalOpen}
        title="Confirm Booking"
        message={`The booking will be successfully saved with reference ID: ${bookingRef}`}
        onConfirm={handleModalClose}
        confirmButtonText="Close"
        // Removed the cancel button by not passing onCancel
      />
    </div>
  );
};

export default AdminBooking;