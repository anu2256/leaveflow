const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/team/requests
router.get(
  '/requests',
  requireRole('MANAGER', 'HR_ADMIN'),
  async (req, res, next) => {
    try {
      let result;

      if (req.user.role === 'MANAGER') {
        result = await pool.query(
          `SELECT
             lr.*,
             u.name AS employee_name,
             u.email AS employee_email
           FROM leave_requests lr
           JOIN users u
             ON u.id = lr.user_id
           WHERE u.manager_id = $1
             AND lr.status = 'PENDING'
           ORDER BY lr.id`,
          [req.user.id]
        );
      } else {
        result = await pool.query(
          `SELECT
             lr.*,
             u.name AS employee_name,
             u.email AS employee_email
           FROM leave_requests lr
           JOIN users u
             ON u.id = lr.user_id
           ORDER BY lr.id`
        );
      }

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;