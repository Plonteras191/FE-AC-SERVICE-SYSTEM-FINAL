import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { parseISO, format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/Booking.css';

const serviceOptions = {
  cleaning: "Cleaning",
  repair: "Repair",
  installation: "Installation",
};

const Booking = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDates, setServiceDates] = useState({}); // Stores a date for each service
  const [globalAvailableDates, setGlobalAvailableDates] = useState([]); // Global available dates as Date objects
  const [acTypes, setAcTypes] = useState([]);
  const navigate = useNavigate();

  // Fetch global available dates from backend when component mounts
  useEffect(() => {
    fetch("http://localhost/AC-SERVICE-FINAL/backend/api/getAvailableDates.php?global=1&start=2025-01-01&end=2025-12-31")
      .then(response => response.json())
      .then(data => {
        // Convert each date string into a Date object using parseISO to interpret as local time
        const dates = data.map(dateStr => parseISO(dateStr));
        setGlobalAvailableDates(dates);
      })
      .catch(err => console.error("Error fetching available dates:", err));
  }, []);

  // Handle selection/deselection of services
  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedServices(prev => [...prev, value]);
      setServiceDates(prev => ({ ...prev, [value]: null })); // Initialize date as null for new service
    } else {
      setSelectedServices(prev => prev.filter(service => service !== value));
      setServiceDates(prev => {
        const newDates = { ...prev };
        delete newDates[value];
        return newDates;
      });
    }
  };

  // Handle AC Type checkbox changes
  const handleACTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAcTypes(prev => [...prev, value]);
    } else {
      setAcTypes(prev => prev.filter(type => type !== value));
    }
  };

  // Handle date change for a specific service type
  const handleServiceDateChange = (service, date) => {
    setServiceDates(prev => ({ ...prev, [service]: date }));
  };

  // Global filter: allow only dates that are in the globalAvailableDates list
  const isDateGloballyAvailable = (date) => {
    if (globalAvailableDates.length === 0) return true; // if not loaded, allow selection
    return globalAvailableDates.some(avDate =>
      avDate.toDateString() === date.toDateString()
    );
  };

  // Form submission: validate and send booking data to backend
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that a date is selected and still available for each chosen service
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

    // Prepare booking data for submission
    const formData = new FormData(e.target);
    const bookingData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      completeAddress: formData.get('completeAddress'),
      street: formData.get('street'),
      houseNo: formData.get('houseNo'),
      apartmentNo: formData.get('apartmentNo'),
      // Construct the services array with their type and selected date formatted as YYYY-MM-DD using format()
      services: selectedServices.map(service => ({
        type: serviceOptions[service],
        date: serviceDates[service] ? format(serviceDates[service], 'yyyy-MM-dd') : null,
      })),
      acTypes,
    };

    // POST booking data to the backend API endpoint
    fetch("http://localhost/AC-SERVICE-FINAL/backend/api/booking.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    })
      .then(response => response.json())
      .then(responseData => {
        console.log("Response from backend:", responseData);
        if (responseData.bookingId) {
          navigate('/confirmation', { state: bookingData });
        } else {
          alert("Error saving booking: " + responseData.message);
        }
      })
      .catch(error => {
        console.error("Error saving booking:", error);
      });
  };

  return (
    <div className="booking-container">
      <h2>Book Your Appointment</h2>
      <div className="booking-box">
        <form onSubmit={handleSubmit}>
          {/* Customer Details Section */}
          <div className="customer-details">
            <label htmlFor="name">Name (required):</label>
            <input type="text" id="name" name="name" placeholder="Your Name" required pattern="[A-Za-z ]+" title="Name should contain only letters and spaces." />
            <label htmlFor="phone">Phone Number (required):</label>
            <input type="tel" id="phone" name="phone" placeholder="Your Phone Number" required pattern="^[0-9]{11}$" title="Phone number must be exactly 11 digits." />
            <label htmlFor="email">Email (optional):</label>
            <input type="email" id="email" name="email" placeholder="Your Email" />
          </div>

          {/* Address Section */}
          <div className="address-section">
            <h3>Address (required)</h3>
            <div className="complete-address">
              <input type="text" id="completeAddress" name="completeAddress" placeholder="Enter complete address" required />
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
                  <input type="checkbox" value={key} checked={selectedServices.includes(key)} onChange={handleServiceChange} />
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
                      minDate={new Date()}
                      filterDate={isDateGloballyAvailable} // Use the global available dates
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
                <input type="checkbox" value="Central" checked={acTypes.includes("Central")} onChange={handleACTypeChange} />
                Central
              </label>
              <label>
                <input type="checkbox" value="Windows" checked={acTypes.includes("Windows")} onChange={handleACTypeChange} />
                Windows
              </label>
              <label>
                <input type="checkbox" value="Split" checked={acTypes.includes("Split")} onChange={handleACTypeChange} />
                Split
              </label>
            </div>
          </div>

          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
