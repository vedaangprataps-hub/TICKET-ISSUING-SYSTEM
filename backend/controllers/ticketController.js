const db = require('../db');

// GET /api/tickets - Fetch all tickets (Admin/Operator view)
const getAllTickets = async (req, res) => {
  try {
    const sql = `
      SELECT 
        t.ticket_id,
        t.passenger_id,
        p.name AS passenger_name,
        p.phone AS passenger_phone,
        t.user_id,
        u.name AS user_name,
        u.email AS user_email,
        t.route_id,
        r.source,
        r.destination,
        r.fare,
        t.ticket_type,
        t.quantity,
        t.total_amount,
        t.status,
        t.issue_date,
        pm.payment_id,
        pm.payment_method,
        pm.payment_status
      FROM tickets t
      JOIN passengers p ON t.passenger_id = p.passenger_id
      JOIN routes r ON t.route_id = r.route_id
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN payments pm ON t.ticket_id = pm.ticket_id
      ORDER BY t.ticket_id DESC;
    `;
    const tickets = await db.query(sql);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets', error: error.message });
  }
};

// GET /api/tickets/:id - Fetch single ticket details
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        t.ticket_id,
        t.passenger_id,
        p.name AS passenger_name,
        p.phone AS passenger_phone,
        t.user_id,
        u.name AS user_name,
        u.email AS user_email,
        t.route_id,
        r.source,
        r.destination,
        r.fare,
        t.ticket_type,
        t.quantity,
        t.total_amount,
        t.status,
        t.issue_date,
        pm.payment_id,
        pm.payment_method,
        pm.payment_status
      FROM tickets t
      JOIN passengers p ON t.passenger_id = p.passenger_id
      JOIN routes r ON t.route_id = r.route_id
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN payments pm ON t.ticket_id = pm.ticket_id
      WHERE t.ticket_id = ?;
    `;
    const tickets = await db.query(sql, [id]);

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    // Authorization check: If logged in user is regular USER, verify ticket belongs to them
    if (req.user && req.user.role === 'USER' && ticket.user_id && ticket.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this ticket.' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket details', error: error.message });
  }
};

// POST /api/tickets - Create ticket (Uses MySQL Transaction)
const createTicket = async (req, res) => {
  try {
    let { name, phone, route_id, ticket_type, quantity, payment_method } = req.body;

    if (req.user) {
      if (!name || !name.trim()) name = req.user.name;
      if (!phone || !phone.trim()) phone = req.user.phone;
    }

    const userId = req.user ? req.user.user_id : null;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Passenger name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Passenger phone number is required' });
    }
    if (!route_id) {
      return res.status(400).json({ success: false, message: 'Route selection is required' });
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }
    if (!payment_method || !payment_method.trim()) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const resultTicket = await db.executeTransaction(async (txQuery) => {
      const existingPassengers = await txQuery(
        'SELECT passenger_id FROM passengers WHERE name = ? AND phone = ?',
        [name.trim(), phone.trim()]
      );

      let passengerId;
      if (existingPassengers.length > 0) {
        passengerId = existingPassengers[0].passenger_id;
      } else {
        const passResult = await txQuery(
          'INSERT INTO passengers (name, phone) VALUES (?, ?)',
          [name.trim(), phone.trim()]
        );
        passengerId = passResult.insertId || passResult[0]?.insertId;
      }

      const routes = await txQuery('SELECT fare FROM routes WHERE route_id = ?', [route_id]);
      if (routes.length === 0) {
        throw new Error('Selected route does not exist');
      }
      const routeFare = parseFloat(routes[0].fare);
      const totalAmount = (routeFare * qty).toFixed(2);

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const ticketResult = await txQuery(
        "INSERT INTO tickets (passenger_id, user_id, route_id, ticket_type, quantity, total_amount, status, issue_date) VALUES (?, ?, ?, ?, ?, ?, 'BOOKED', ?)",
        [passengerId, userId, route_id, ticket_type || 'Adult', qty, totalAmount, now]
      );
      const ticketId = ticketResult.insertId || ticketResult[0]?.insertId;

      await txQuery(
        "INSERT INTO payments (ticket_id, payment_method, amount, payment_status) VALUES (?, ?, ?, 'PAID')",
        [ticketId, payment_method.trim(), totalAmount]
      );

      const newTicketDetails = await txQuery(
        `SELECT 
          t.ticket_id,
          t.passenger_id,
          p.name AS passenger_name,
          p.phone AS passenger_phone,
          t.user_id,
          t.route_id,
          r.source,
          r.destination,
          r.fare,
          t.ticket_type,
          t.quantity,
          t.total_amount,
          t.status,
          t.issue_date,
          pm.payment_id,
          pm.payment_method,
          pm.payment_status
        FROM tickets t
        JOIN passengers p ON t.passenger_id = p.passenger_id
        JOIN routes r ON t.route_id = r.route_id
        LEFT JOIN payments pm ON t.ticket_id = pm.ticket_id
        WHERE t.ticket_id = ?`,
        [ticketId]
      );

      return newTicketDetails[0];
    });

    res.status(201).json({
      success: true,
      message: 'Ticket issued successfully',
      data: resultTicket
    });

  } catch (error) {
    console.error('Transaction error issuing ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to issue ticket. Transaction rolled back.'
    });
  }
};

// PUT /api/tickets/:id/cancel - Cancel ticket using Database Transaction
const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketId = parseInt(id, 10);

    if (isNaN(ticketId)) {
      return res.status(400).json({ success: false, message: 'Ticket cannot be cancelled.' });
    }

    const userId = req.user ? req.user.user_id : null;
    const userRole = req.user ? req.user.role : null;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please login again.' });
    }

    // Execute atomic MySQL/SQLite transaction
    const result = await db.executeTransaction(async (txQuery) => {
      // 1. Fetch ticket to verify existence and ownership
      const tickets = await txQuery('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId]);
      if (tickets.length === 0) {
        const err = new Error('Ticket not found.');
        err.statusCode = 404;
        throw err;
      }

      const ticket = tickets[0];

      // 2. Ownership check: Regular USER can ONLY cancel their OWN ticket
      if (userRole !== 'ADMIN') {
        if (!ticket.user_id || ticket.user_id !== userId) {
          const err = new Error('You are not authorized to cancel this ticket.');
          err.statusCode = 403;
          throw err;
        }
      }

      // 3. Status check: Ticket must be currently BOOKED
      if (ticket.status === 'CANCELLED') {
        const err = new Error('Ticket cannot be cancelled.');
        err.statusCode = 400;
        throw err;
      }

      // 4. Update ticket status atomically
      let updateTicketResult;
      if (userRole === 'ADMIN') {
        updateTicketResult = await txQuery(
          "UPDATE tickets SET status = 'CANCELLED' WHERE ticket_id = ? AND status = 'BOOKED'",
          [ticketId]
        );
      } else {
        updateTicketResult = await txQuery(
          "UPDATE tickets SET status = 'CANCELLED' WHERE ticket_id = ? AND user_id = ? AND status = 'BOOKED'",
          [ticketId, userId]
        );
      }

      const affectedRows = updateTicketResult.affectedRows !== undefined 
        ? updateTicketResult.affectedRows 
        : updateTicketResult[0]?.affectedRows;

      if (affectedRows === 0) {
        const err = new Error('Ticket cannot be cancelled.');
        err.statusCode = 400;
        throw err;
      }

      // 5. Update payment status to REFUNDED
      await txQuery(
        "UPDATE payments SET payment_status = 'REFUNDED' WHERE ticket_id = ?",
        [ticketId]
      );

      return {
        ticket_id: ticketId,
        status: 'CANCELLED',
        payment_status: 'REFUNDED'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: result
    });

  } catch (error) {
    console.error('Cancellation transaction error:', error.message);
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Unable to cancel ticket. Please try again.';
    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  cancelTicket,
};
