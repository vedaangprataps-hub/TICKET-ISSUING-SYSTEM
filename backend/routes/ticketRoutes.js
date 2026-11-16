const express = require('express');
const router = express.Router();
const { getAllTickets, getTicketById, createTicket, cancelTicket } = require('../controllers/ticketController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getAllTickets);
router.get('/:id', optionalAuth, getTicketById);
router.post('/', optionalAuth, createTicket);
router.put('/:id/cancel', requireAuth, cancelTicket);

module.exports = router;
