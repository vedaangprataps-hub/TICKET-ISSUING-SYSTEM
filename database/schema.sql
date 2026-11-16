-- Database Creation
CREATE DATABASE IF NOT EXISTS ticket_issuing_system;
USE ticket_issuing_system;

-- Drop tables if they already exist (for clean setup)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Passengers Table
CREATE TABLE passengers (
    passenger_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15)
);

-- 3. Routes Table
CREATE TABLE routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    fare DECIMAL(10,2) NOT NULL
);

-- 4. Tickets Table
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    passenger_id INT NOT NULL,
    user_id INT NULL,
    route_id INT NOT NULL,
    ticket_type VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('BOOKED', 'CANCELLED') DEFAULT 'BOOKED',
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

-- 5. Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'PAID',
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);
