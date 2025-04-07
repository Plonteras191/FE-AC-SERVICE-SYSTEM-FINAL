-- Main Bookings Table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  complete_address TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Services Table: one row per service per booking
CREATE TABLE booking_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_type VARCHAR(50) NOT NULL, -- e.g., 'Repair', 'Installation', 'Cleaning'
  appointment_date DATE NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Booking AC Types Table: one row per AC type per booking
CREATE TABLE booking_actypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  ac_type VARCHAR(50) NOT NULL, -- e.g., 'Window', 'Split', 'Central'
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Revenue History Table
CREATE TABLE revenue_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  revenue_date DATE NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
