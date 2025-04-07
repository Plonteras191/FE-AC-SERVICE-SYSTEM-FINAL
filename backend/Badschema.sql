CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  complete_address TEXT NOT NULL,
  street VARCHAR(255),
  house_no VARCHAR(50),
  apartment_no VARCHAR(50),
  services JSON NOT NULL,
  ac_types JSON NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_type VARCHAR(50) NOT NULL, -- e.g., 'Repair', 'Installation', 'Cleaning'
  appointment_date DATE NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);


CREATE TABLE revenue_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  revenue_date DATE NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


