const express = require('express');
const router = express.Router();
const { getUserDashboard, getUserTickets } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/dashboard', requireAuth, getUserDashboard);
router.get('/tickets', requireAuth, getUserTickets);

module.exports = router;
