const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/leave-requests
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      'PENDING',
      'APPROVED',
      'REJECTED',
      'CANCELLED'
    ];

    if (status && !allowedStatuses.includes(status)) {
      const error = new Error('invalid status');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    let result;

    if (status) {
      result = await pool.query(
        'SELECT * FROM leave_requests WHERE status = $1 ORDER BY id',
        [status]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM leave_requests ORDER BY id'
      );
    }

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});
// POST /api/leave-requests
router.post('/', async (req, res, next) => {
  try {
    const {
      user_id,
      leave_type_id,
      start_date,
      end_date,
      reason
    } = req.body;

    if (!user_id || !leave_type_id || !start_date || !end_date) {
      const error = new Error(
        'user_id, leave_type_id, start_date and end_date are required'
      );
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    if (end_date < start_date) {
      const error = new Error(
        'end_date must be on or after start_date'
      );
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    const days =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days > 30) {
      const error = new Error(
        'leave request cannot be longer than 30 days'
      );
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    const leaveType = await pool.query(
      'SELECT annual_allocation FROM leave_types WHERE id = $1',
      [leave_type_id]
    );

    if (leaveType.rowCount === 0) {
      const error = new Error('no such leave type');
      error.status = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    const currentYear = new Date(start_date).getFullYear();

    const balance = await pool.query(
      `SELECT used_days
       FROM leave_balances
       WHERE user_id = $1
         AND leave_type_id = $2
         AND year = $3`,
      [user_id, leave_type_id, currentYear]
    );

    const usedDays = balance.rowCount
      ? Number(balance.rows[0].used_days)
      : 0;

    const allocation = Number(
      leaveType.rows[0].annual_allocation
    );

    if (usedDays + days > allocation) {
      const error = new Error('insufficient leave balance');
      error.status = 409;
      error.code = 'INSUFFICIENT_BALANCE';
      return next(error);
    }

    const result = await pool.query(
      `INSERT INTO leave_requests
       (user_id, leave_type_id, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        user_id,
        leave_type_id,
        start_date,
        end_date,
        reason || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
// PATCH /api/leave-requests/:id
// PATCH /api/leave-requests/:id
router.patch('/:id', async (req, res, next) => {
  const { action, decided_by } = req.body;

  if (action !== 'approve' && action !== 'reject') {
    const error = new Error(
      'action must be "approve" or "reject"'
    );
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    return next(error);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT *
       FROM leave_requests
       WHERE id = $1
       FOR UPDATE`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');

      const error = new Error('no such leave request');
      error.status = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    const row = result.rows[0];

    if (row.status !== 'PENDING') {
      await client.query('ROLLBACK');

      const error = new Error(
        'request is already ' + row.status
      );
      error.status = 409;
      error.code = 'INVALID_STATE';
      return next(error);
    }

    const status = action === 'approve'
      ? 'APPROVED'
      : 'REJECTED';

    // If approving, calculate the number of leave days
    if (action === 'approve') {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);

      const days =
        Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const year = start.getFullYear();

      await client.query(
        `INSERT INTO leave_balances
         (user_id, leave_type_id, year, used_days)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, leave_type_id, year)
         DO UPDATE SET used_days =
           leave_balances.used_days + EXCLUDED.used_days`,
        [
          row.user_id,
          row.leave_type_id,
          year,
          days
        ]
      );
    }

    const updated = await client.query(
      `UPDATE leave_requests
       SET status = $1,
           decided_by = $2,
           decided_at = now()
       WHERE id = $3
       RETURNING *`,
      [status, decided_by || null, req.params.id]
    );

    await client.query('COMMIT');

    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});
// DELETE /api/leave-requests/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leave_requests WHERE id = $1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      const error = new Error('no such leave request');
      error.status = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    const row = result.rows[0];

    if (row.status !== 'PENDING') {
      const error = new Error(
        'only PENDING requests can be cancelled'
      );
      error.status = 409;
      error.code = 'INVALID_STATE';
      return next(error);
    }

    const updated = await pool.query(
      `UPDATE leave_requests
       SET status = 'CANCELLED'
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});
module.exports = router;