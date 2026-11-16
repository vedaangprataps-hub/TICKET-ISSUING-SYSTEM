const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUsers = await db.query('SELECT user_id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Always register new accounts with role 'USER'
    const result = await db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, phone ? phone.trim() : '', hashedPassword, 'USER']
    );

    const userId = result[0]?.insertId || result.insertId;

    const userObj = {
      user_id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      role: 'USER',
    };

    const token = jwt.sign(
      { user_id: userId, role: 'USER', name: userObj.name, email: cleanEmail, phone: userObj.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const users = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userObj = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const users = await db.query(
      'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
