const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const routeRoutes = require('./routes/routeRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    project: 'TICKET ISSUING SYSTEM API',
    status: 'Running',
    version: '2.0 (Admin & User Modes)',
    database_mode: db.getMode()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server after Database Initialization
db.initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Ticket Issuing System Backend running on port ${PORT}`);
    console.log(` Health check available at http://localhost:${PORT}/`);
    console.log(` Database Mode: ${db.getMode().toUpperCase()}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
