const db = require('../db');

// GET /api/user/dashboard - Get user-specific statistics
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Valid user session required.' });
    }

    // 1. Total bookings count for the logged-in user
    const totalCountRes = await db.query(
      'SELECT COUNT(*) AS total FROM tickets WHERE user_id = ?',
      [userId]
    );
    const totalBookings = parseInt(totalCountRes[0]?.total || 0, 10);

    // 2. Active tickets count for the logged-in user (status = 'BOOKED')
    const activeCountRes = await db.query(
      "SELECT COUNT(*) AS active FROM tickets WHERE user_id = ? AND status = 'BOOKED'",
      [userId]
    );
    const activeTickets = parseInt(activeCountRes[0]?.active || 0, 10);

    // 3. Cancelled tickets count for the logged-in user (status = 'CANCELLED')
    const cancelledCountRes = await db.query(
      "SELECT COUNT(*) AS cancelled FROM tickets WHERE user_id = ? AND status = 'CANCELLED'",
      [userId]
    );
    const cancelledTickets = parseInt(cancelledCountRes[0]?.cancelled || 0, 10);

    // 4. Total spending on active BOOKED tickets for the logged-in user
    const spendingRes = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS total_spent FROM tickets WHERE user_id = ? AND status = 'BOOKED'",
      [userId]
    );
    const rawTotalSpent = spendingRes[0]?.total_spent || 0;
    const totalSpentNum = parseFloat(rawTotalSpent);

    // 5. Recent 5 tickets for user
    const recentTicketsSql = `
      SELECT 
        t.ticket_id,
        t.passenger_id,
        p.name AS passenger_name,
        p.phone AS passenger_phone,
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
      LEFT JOIN payments pm ON t.ticket_id = pm.ticket_id
      WHERE t.user_id = ?
      ORDER BY t.ticket_id DESC
      LIMIT 5;
    `;
    const recentTickets = await db.query(recentTicketsSql, [userId]);

    res.json({
      success: true,
      data: {
        totalBookings,
        totalTickets: totalBookings,
        activeTickets,
        cancelledTickets,
        totalSpent: totalSpentNum,
        totalSpending: totalSpentNum.toFixed(2),
        recentTickets
      }
    });

  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user dashboard',
      error: error.message
    });
  }
};

// GET /api/user/tickets - Returns ONLY tickets belonging to logged-in user
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const sql = `
      SELECT 
        t.ticket_id,
        t.passenger_id,
        p.name AS passenger_name,
        p.phone AS passenger_phone,
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
      WHERE t.user_id = ?
      ORDER BY t.ticket_id DESC;
    `;

    const tickets = await db.query(sql, [userId]);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user tickets', error: error.message });
  }
};

module.exports = {
  getUserDashboard,
  getUserTickets,
};
