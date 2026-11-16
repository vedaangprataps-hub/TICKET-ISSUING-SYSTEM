const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/authMiddleware');

const {
  getAdminDashboard,
  getAdminRoutes,
  createAdminRoute,
  updateAdminRoute,
  deleteAdminRoute,
  getAdminUsers,
  updateUserRole,
  deleteAdminUser,
  getAdminPassengers,
  getAdminTickets,
  getAdminPayments,
} = require('../controllers/adminController');

// All admin routes require ADMIN role
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Route Management
router.get('/routes', getAdminRoutes);
router.post('/routes', createAdminRoute);
router.put('/routes/:id', updateAdminRoute);
router.delete('/routes/:id', deleteAdminRoute);

// User Management
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteAdminUser);

// Passenger Management
router.get('/passengers', getAdminPassengers);

// Ticket Management
router.get('/tickets', getAdminTickets);

// Payment Management
router.get('/payments', getAdminPayments);

module.exports = router;
