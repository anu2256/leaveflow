const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/holidays?year=2026  — any authenticated user
router.get('/', async (req, res, next) => {
  try {
    const { year } = req.query;

    const result = year
      ? await pool.query(
          `SELECT id, holiday_date, name, year
             FROM public_holidays
            WHERE year = $1
            ORDER BY holiday_date`,
          [year]
        )
      : await pool.query(
          `SELECT id, holiday_date, name, year
             FROM public_holidays
            ORDER BY holiday_date`
        );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/holidays  — HR_ADMIN only. Create or update (upsert) a holiday.
router.post('/', requireRole('HR_ADMIN'), async (req, res, next) => {
  try {
    const { holiday_date, name, year } = req.body || {};

    if (!holiday_date || !name) {
      const error = new Error('holiday_date and name are required');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const resolvedYear = year || new Date(holiday_date).getFullYear();

    const result = await pool.query(
      `INSERT INTO public_holidays (holiday_date, name, year)
       VALUES ($1, $2, $3)
       ON CONFLICT (holiday_date)
       DO UPDATE SET name = EXCLUDED.name, year = EXCLUDED.year
       RETURNING id, holiday_date, name, year`,
      [holiday_date, name, resolvedYear]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/holidays/:id  — HR_ADMIN only.
router.delete('/:id', requireRole('HR_ADMIN'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM public_holidays WHERE id = $1 RETURNING id, holiday_date, name, year',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      const error = new Error('no such holiday');
      error.status = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
