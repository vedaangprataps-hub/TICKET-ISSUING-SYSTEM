const db = require('../db');

// GET /api/routes - Fetch all available routes
const getRoutes = async (req, res) => {
  try {
    const routes = await db.query('SELECT * FROM routes ORDER BY source ASC, destination ASC');
    res.json({ success: true, data: routes });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch routes', error: error.message });
  }
};

module.exports = {
  getRoutes,
};
