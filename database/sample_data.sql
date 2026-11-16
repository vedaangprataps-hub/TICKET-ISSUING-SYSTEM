USE ticket_issuing_system;

-- Insert Default Admin and Sample Users (Passwords hashed with bcrypt)
-- Admin Password: admin123
-- User Password: user123
INSERT INTO users (name, email, phone, password, role) VALUES
('System Administrator', 'admin@ticket.com', '9998887770', '$2b$10$IDOR9yUSehHj8k070hq8V.2GYQgBiTaWny0d7Op1eV6gw6D3ZkR/m', 'ADMIN'),
('Rahul Sharma', 'rahul@gmail.com', '9876543210', '$2b$10$tQlBBvpYfrvwgLHOkAglFOLCLTWw3Hqn5.exf1Q7evi7kkky8c/re', 'USER'),
('Priya Sundaram', 'priya@gmail.com', '9876543211', '$2b$10$tQlBBvpYfrvwgLHOkAglFOLCLTWw3Hqn5.exf1Q7evi7kkky8c/re', 'USER');

-- Insert Sample Routes
INSERT INTO routes (source, destination, fare) VALUES
('Chennai Central', 'Tambaram', 40.00),
('Chennai Central', 'Guindy', 25.00),
('Koyambedu', 'Velachery', 35.00),
('Koyambedu', 'Airport', 50.00),
('Bengaluru City', 'Electronic City', 60.00),
('Bengaluru City', 'Whitefield', 55.00),
('Majestic', 'Airport', 150.00),
('Mumbai Central', 'Thane', 45.00),
('Dadar', 'Andheri', 30.00),
('Delhi ISBT', 'Gurgaon City Center', 70.00);

-- Insert Sample Passengers
INSERT INTO passengers (name, phone) VALUES
('Rahul Sharma', '9876543210'),
('Priya Sundaram', '9876543211'),
('Amit Verma', '9876543212');

-- Insert Sample Tickets (Linked to user_id and with status BOOKED)
INSERT INTO tickets (passenger_id, user_id, route_id, ticket_type, quantity, total_amount, status, issue_date) VALUES
(1, 2, 1, 'Adult', 2, 80.00, 'BOOKED', NOW() - INTERVAL 2 HOUR),
(2, 3, 2, 'Senior', 1, 25.00, 'BOOKED', NOW() - INTERVAL 1 HOUR);

-- Insert Sample Payments
INSERT INTO payments (ticket_id, payment_method, amount, payment_status) VALUES
(1, 'UPI', 80.00, 'PAID'),
(2, 'Cash', 25.00, 'PAID');
