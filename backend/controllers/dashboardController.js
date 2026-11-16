const db = require('../db');

// GET /api/dashboard - Fetch total tickets, total revenue, and recent tickets
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Tickets Count
    const ticketCountResult = await db.query('SELECT COUNT(*) AS total_tickets FROM tickets');
    const totalTickets = ticketCountResult[0]?.total_tickets || 0;

    // 2. Total Revenue
    const revenueResult = await db.query('SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM tickets');
    const totalRevenue = revenueResult[0]?.total_revenue || 0;

    // 3. Recent 5 Tickets
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
        t.issue_date,
        pm.payment_method,
        pm.payment_status
      FROM tickets t
      JOIN passengers p ON t.passenger_id = p.passenger_id
      JOIN routes r ON t.route_id = r.route_id
      LEFT JOIN payments pm ON t.ticket_id = pm.ticket_id
      ORDER BY t.ticket_id DESC
      LIMIT 5;
    `;
    const recentTickets = await db.query(recentTicketsSql);

    res.json({
      success: true,
      data: {
        totalTickets: parseInt(totalTickets, 10),
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        recentTickets
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
};
