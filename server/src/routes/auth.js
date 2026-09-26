const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('email and password are required');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      const error = new Error('invalid email or password');
      error.status = 401;
      error.code = 'BAD_CREDENTIALS';
      return next(error);
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      const error = new Error('invalid email or password');
      error.status = 401;
      error.code = 'BAD_CREDENTIALS';
      return next(error);
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/me
router.get('/me', requireAuth, (req, res, next) => {
  if (!req.user) {
    const error = new Error('authentication required');
    error.status = 401;
    error.code = 'NO_TOKEN';
    return next(error);
  }

  res.json(req.user);
});

module.exports = router;