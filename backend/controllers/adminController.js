const db = require('../db');

// GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) AS count FROM users');
    const passengerCount = await db.query('SELECT COUNT(*) AS count FROM passengers');
    const ticketCount = await db.query('SELECT COUNT(*) AS count FROM tickets');
    const activeCount = await db.query("SELECT COUNT(*) AS count FROM tickets WHERE status = 'BOOKED'");
    const cancelledCount = await db.query("SELECT COUNT(*) AS count FROM tickets WHERE status = 'CANCELLED'");
    
    // Revenue calculated from active (BOOKED) tickets only
    const revenueRes = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM tickets WHERE status = 'BOOKED'"
    );

    const recentTicketsSql = `
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
        pm.payment_method,
        pm.payment_status
      FROM tickets t
      JOIN passengers p ON t.passenger_id = p.passenger_id
      JOIN routes r ON t.route_id = r.route_id
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN payments pm ON t.ticket_id = pm.ticket_id
      ORDER BY t.ticket_id DESC
      LIMIT 5;
    `;
    const recentTickets = await db.query(recentTicketsSql);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(userCount[0]?.count || 0, 10),
        totalPassengers: parseInt(passengerCount[0]?.count || 0, 10),
        totalTickets: parseInt(ticketCount[0]?.count || 0, 10),
        activeTickets: parseInt(activeCount[0]?.count || 0, 10),
        cancelledTickets: parseInt(cancelledCount[0]?.count || 0, 10),
        totalRevenue: parseFloat(revenueRes[0]?.total_revenue || 0).toFixed(2),
        recentTickets
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard stats', error: error.message });
  }
};

// Route Management
const getAdminRoutes = async (req, res) => {
  try {
    const routes = await db.query('SELECT * FROM routes ORDER BY route_id DESC');
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch routes', error: error.message });
  }
};

const createAdminRoute = async (req, res) => {
  try {
    const { source, destination, fare } = req.body;
    if (!source || !source.trim() || !destination || !destination.trim() || !fare) {
      return res.status(400).json({ success: false, message: 'Source, destination, and fare are required' });
    }
    const fareVal = parseFloat(fare);
    if (isNaN(fareVal) || fareVal <= 0) {
      return res.status(400).json({ success: false, message: 'Fare must be a positive number' });
    }

    const result = await db.query(
      'INSERT INTO routes (source, destination, fare) VALUES (?, ?, ?)',
      [source.trim(), destination.trim(), fareVal]
    );
    const newRouteId = result[0]?.insertId || result.insertId;

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: { route_id: newRouteId, source: source.trim(), destination: destination.trim(), fare: fareVal }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create route', error: error.message });
  }
};

const updateAdminRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, destination, fare } = req.body;

    if (!source || !destination || !fare) {
      return res.status(400).json({ success: false, message: 'Source, destination, and fare are required' });
    }

    await db.query(
      'UPDATE routes SET source = ?, destination = ?, fare = ? WHERE route_id = ?',
      [source.trim(), destination.trim(), parseFloat(fare), id]
    );

    res.json({ success: true, message: 'Route updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update route', error: error.message });
  }
};

const deleteAdminRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const tickets = await db.query('SELECT ticket_id FROM tickets WHERE route_id = ? LIMIT 1', [id]);
    if (tickets.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route because existing tickets are associated with it.'
      });
    }

    await db.query('DELETE FROM routes WHERE route_id = ?', [id]);
    res.json({ success: true, message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete route', error: error.message });
  }
};

// User Management
const getAdminUsers = async (req, res) => {
  try {
    const users = await db.query(
      'SELECT user_id, name, email, phone, role, created_at FROM users ORDER BY user_id DESC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await db.query('SELECT role FROM users WHERE user_id = ?', [id]);
    if (targetUser.length > 0 && targetUser[0].role === 'ADMIN') {
      const adminCount = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'ADMIN'");
      if (adminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Action prohibited: Cannot delete the only remaining admin account!'
        });
      }
    }

    await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

// Passenger Management
const getAdminPassengers = async (req, res) => {
  try {
    const passengers = await db.query('SELECT * FROM passengers ORDER BY passenger_id DESC');
    res.json({ success: true, data: passengers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch passengers', error: error.message });
  }
};

// Ticket Management (Admin)
const getAdminTickets = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Failed to fetch admin tickets', error: error.message });
  }
};

// Payment Management (Admin)
const getAdminPayments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pm.payment_id,
        pm.ticket_id,
        pm.payment_method,
        pm.amount,
        pm.payment_status,
        t.issue_date,
        p.name AS passenger_name
      FROM payments pm
      JOIN tickets t ON pm.ticket_id = t.ticket_id
      JOIN passengers p ON t.passenger_id = p.passenger_id
      ORDER BY pm.payment_id DESC;
    `;
    const payments = await db.query(sql);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
};

module.exports = {
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
};
