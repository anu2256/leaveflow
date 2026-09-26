const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/balances?user_id=2&year=2026
router.get('/', async (req, res, next) => {
  try {
    const { user_id, year } = req.query;

    if (!user_id || !year) {
      const error = new Error(
        'user_id and year are required'
      );
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const result = await pool.query(
      `SELECT
         lb.user_id,
         lb.leave_type_id,
         lt.name AS leave_type,
         lt.annual_allocation,
         lb.used_days,
         (lt.annual_allocation - lb.used_days) AS remaining_days
       FROM leave_balances lb
       JOIN leave_types lt
         ON lt.id = lb.leave_type_id
       WHERE lb.user_id = $1
         AND lb.year = $2
       ORDER BY lb.leave_type_id`,
      [user_id, year]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;