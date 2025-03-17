import React from 'react';
import '../styles/Services.css';

const Services = () => {
  const services = [
    {
      title: 'Routine Maintenance and Cleaning',
      description: 'Regular check-ups and cleaning to keep your AC running efficiently and prevent unexpected breakdowns.',
      price: 'Price range from ₱500 - 2500',
    },
    {
      title: 'Repair',
      description: 'Quick and reliable repairs to fix any issues with your air conditioning system, ensuring maximum comfort.',
      price: 'Price range from ₱1000 - 3000',
    },
    {
      title: 'Installation',
      description: 'Professional installation services for new air conditioning units with expert advice and support.',
      price: 'Price range from ₱1500 - 5000',
    },
  ];

  return (
    <div className="services-container">
      <h2>Our Services</h2>
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-box">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {service.price && <p className="service-price">{service.price}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
