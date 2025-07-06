-- Add customer_name column to appointments table
-- This column stores the full name of the customer making the reservation

-- Add the column
ALTER TABLE appointments 
ADD COLUMN customer_name VARCHAR(100);

-- Add comment to describe the column
COMMENT ON COLUMN appointments.customer_name IS 'Full name of the customer making the reservation';

-- Optional: Add index for faster searches by customer name
CREATE INDEX idx_appointments_customer_name ON appointments(customer_name);

-- Verify the column was added successfully
\d appointments;

-- Sample query to test the new column
-- INSERT INTO appointments (customer_name, email, phone, appointment_date, appointment_time, barber_id, service_type, service_price, status)
-- VALUES ('Juan Pérez', 'juan@example.com', '+54 11 1234-5678', '2025-01-15', '10:00', 1, 'Corte de pelo', 8500, 'confirmado');