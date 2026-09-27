const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/balances?user_id=2&year=2026
router.get('/', async (req, res, next) => {
  try {
    const { year } = req.query;
    const user_id = req.user.id;
   if (!year) {
      const error = new Error(
        'user_id and year are required'
      );
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const result = await pool.query(
      `SELECT
         $1::int AS user_id,
         lt.id AS leave_type_id,
         lt.name AS leave_type,
         lt.annual_allocation,
         COALESCE(lb.used_days, 0) AS used_days,
         (lt.annual_allocation - COALESCE(lb.used_days, 0)) AS remaining_days
       FROM leave_types lt
       LEFT JOIN leave_balances lb
         ON lb.leave_type_id = lt.id
        AND lb.user_id = $1
        AND lb.year = $2
       ORDER BY lt.id`,
      [user_id, year]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;