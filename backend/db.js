const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let mode = 'mysql';
let mysqlPool = null;
let sqliteDb = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket_issuing_system',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const sampleRoutes = [
  { source: 'Chennai Central', destination: 'Tambaram', fare: 40.00 },
  { source: 'Chennai Central', destination: 'Guindy', fare: 25.00 },
  { source: 'Koyambedu', destination: 'Velachery', fare: 35.00 },
  { source: 'Koyambedu', destination: 'Airport', fare: 50.00 },
  { source: 'Bengaluru City', destination: 'Electronic City', fare: 60.00 },
  { source: 'Bengaluru City', destination: 'Whitefield', fare: 55.00 },
  { source: 'Majestic', destination: 'Airport', fare: 150.00 },
  { source: 'Mumbai Central', destination: 'Thane', fare: 45.00 },
  { source: 'Dadar', destination: 'Andheri', fare: 30.00 },
  { source: 'Delhi ISBT', destination: 'Gurgaon City Center', fare: 70.00 }
];

const ADMIN_HASH = '$2b$10$IDOR9yUSehHj8k070hq8V.2GYQgBiTaWny0d7Op1eV6gw6D3ZkR/m'; // admin123
const USER_HASH = '$2b$10$tQlBBvpYfrvwgLHOkAglFOLCLTWw3Hqn5.exf1Q7evi7kkky8c/re';   // user123

async function initializeDatabase() {
  try {
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    mysqlPool = mysql.createPool(dbConfig);
    const connection = await mysqlPool.getConnection();
    
    // Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(15),
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'USER') DEFAULT 'USER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Passengers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS passengers (
        passenger_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15)
      );
    `);

    // Create Routes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS routes (
        route_id INT PRIMARY KEY AUTO_INCREMENT,
        source VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        fare DECIMAL(10,2) NOT NULL
      );
    `);

    // Create Tickets Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tickets (
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
    `);

    // Create Payments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_id INT NOT NULL,
        payment_method VARCHAR(30) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(30) DEFAULT 'PAID',
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
      );
    `);

    // Seed Default Admin and Users
    const [adminCheck] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@ticket.com']);
    if (adminCheck[0].count === 0) {
      console.log('Seeding Default Admin (admin@ticket.com)...');
      await connection.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['System Administrator', 'admin@ticket.com', '9998887770', ADMIN_HASH, 'ADMIN']
      );
      await connection.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Rahul Sharma', 'rahul@gmail.com', '9876543210', USER_HASH, 'USER']
      );
    }

    // Seed Routes
    const [routeCheck] = await connection.query('SELECT COUNT(*) as count FROM routes');
    if (routeCheck[0].count === 0) {
      console.log('Seeding MySQL routes...');
      for (const r of sampleRoutes) {
        await connection.query('INSERT INTO routes (source, destination, fare) VALUES (?, ?, ?)', [r.source, r.destination, r.fare]);
      }
    }

    connection.release();
    mode = 'mysql';
    console.log(`[Database] Connected to MySQL database "${dbConfig.database}"`);
  } catch (mysqlErr) {
    console.warn(`[Database Warning] MySQL connection failed (${mysqlErr.message}).`);
    console.warn(`[Database Warning] Falling back to SQLite local database...`);
    
    mode = 'sqlite';
    sqliteDb = await open({
      filename: path.join(__dirname, 'ticket_issuing.db'),
      driver: sqlite3.Database
    });

    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS passengers (
        passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT
      );

      CREATE TABLE IF NOT EXISTS routes (
        route_id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        destination TEXT NOT NULL,
        fare REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        passenger_id INTEGER NOT NULL,
        user_id INTEGER NULL,
        route_id INTEGER NOT NULL,
        ticket_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'BOOKED',
        issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (route_id) REFERENCES routes(route_id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'PAID',
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
      );
    `);

    // Ensure columns exist in SQLite if upgrading database schema
    try { await sqliteDb.exec('ALTER TABLE tickets ADD COLUMN user_id INTEGER;'); } catch (e) {}
    try { await sqliteDb.exec("ALTER TABLE tickets ADD COLUMN status TEXT DEFAULT 'BOOKED';"); } catch (e) {}

    const adminCheck = await sqliteDb.get('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@ticket.com']);
    if (adminCheck.count === 0) {
      await sqliteDb.run(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['System Administrator', 'admin@ticket.com', '9998887770', ADMIN_HASH, 'ADMIN']
      );
      await sqliteDb.run(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Rahul Sharma', 'rahul@gmail.com', '9876543210', USER_HASH, 'USER']
      );
    }

    const routeCheck = await sqliteDb.get('SELECT COUNT(*) as count FROM routes');
    if (routeCheck.count === 0) {
      for (const r of sampleRoutes) {
        await sqliteDb.run('INSERT INTO routes (source, destination, fare) VALUES (?, ?, ?)', [r.source, r.destination, r.fare]);
      }
    }
  }
}

async function query(sql, params = []) {
  if (mode === 'mysql') {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  } else {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) {
      return await sqliteDb.all(sql, params);
    } else {
      const result = await sqliteDb.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  }
}

async function executeTransaction(callback) {
  if (mode === 'mysql') {
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    try {
      const txQuery = async (sql, params = []) => {
        const [rows] = await connection.query(sql, params);
        return rows;
      };
      const result = await callback(txQuery);
      await connection.commit();
      connection.release();
      return result;
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } else {
    await sqliteDb.run('BEGIN TRANSACTION');
    try {
      const txQuery = async (sql, params = []) => {
        const trimmed = sql.trim().toUpperCase();
        if (trimmed.startsWith('SELECT')) {
          return await sqliteDb.all(sql, params);
        } else {
          const result = await sqliteDb.run(sql, params);
          return [{ insertId: result.lastID, affectedRows: result.changes }];
        }
      };
      const result = await callback(txQuery);
      await sqliteDb.run('COMMIT');
      return result;
    } catch (err) {
      await sqliteDb.run('ROLLBACK');
      throw err;
    }
  }
}

module.exports = {
  initializeDatabase,
  query,
  executeTransaction,
  getMode: () => mode
};
