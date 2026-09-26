const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
 
});
// Supports optional status filtering, e.g. ?status=PENDING
app.get('/api/leave-requests', (req, res, next) => {
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

  let rows;

  if (status) {
    rows = db
      .prepare(
        'SELECT * FROM leave_requests WHERE status = ? ORDER BY id'
      )
      .all(status);
  } else {
    rows = db
      .prepare('SELECT * FROM leave_requests ORDER BY id')
      .all();
  }

  res.json(rows);
});


app.listen(4000, () => {
  console.log('LeaveFlow v0 running on http://localhost:4000');
});
app.post('/api/leave-requests', (req, res, next) => {
  const { user_id, start_date, end_date, reason } = req.body;

  if (!user_id || !start_date || !end_date) {
    const error = new Error(
      'user_id, start_date and end_date are required'
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

  const result = db.prepare(`
    INSERT INTO leave_requests
    (user_id, start_date, end_date, reason)
    VALUES (?, ?, ?, ?)
  `).run(user_id, start_date, end_date, reason || null);

  const row = db
    .prepare('SELECT * FROM leave_requests WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(row);
});
app.patch('/api/leave-requests/:id', (req, res, next) => {
  const { action, decided_by } = req.body;

  if (action !== 'approve' && action !== 'reject') {
    const error = new Error(
      'action must be "approve" or "reject"'
    );
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    return next(error);
  }

  const row = db
    .prepare('SELECT * FROM leave_requests WHERE id = ?')
    .get(req.params.id);

  if (!row) {
    const error = new Error('no such leave request');
    error.status = 404;
    error.code = 'NOT_FOUND';
    return next(error);
  }

  if (row.status !== 'PENDING') {
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

  db.prepare(`
    UPDATE leave_requests
    SET status = ?, decided_by = ?, decided_at = datetime('now')
    WHERE id = ?
  `).run(status, decided_by || null, req.params.id);

  res.json(
    db
      .prepare('SELECT * FROM leave_requests WHERE id = ?')
      .get(req.params.id)
  );
});
app.delete('/api/leave-requests/:id', (req, res, next) => {
  const row = db
    .prepare('SELECT * FROM leave_requests WHERE id = ?')
    .get(req.params.id);

  if (!row) {
    const error = new Error('no such leave request');
    error.status = 404;
    error.code = 'NOT_FOUND';
    return next(error);
  }

  if (row.status !== 'PENDING') {
    const error = new Error(
      'only PENDING requests can be cancelled'
    );
    error.status = 409;
    error.code = 'INVALID_STATE';
    return next(error);
  }

  db.prepare(`
    UPDATE leave_requests
    SET status = ?
    WHERE id = ?
  `).run('CANCELLED', req.params.id);

  res.json(
    db
      .prepare('SELECT * FROM leave_requests WHERE id = ?')
      .get(req.params.id)
  );
});
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL',
      message: err.message
    }
  });
});

app.listen(4000, () => {
  console.log('LeaveFlow v0 running on http://localhost:4000');
});
