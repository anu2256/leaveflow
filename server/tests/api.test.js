const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/db/pool');

// Reusable login helper. Returns a bearer token and never logs
// the password or the token.
async function login(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body.token;
}

describe('API tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('is connected to the leaveflow_test database', async () => {
    // Arrange / Act
    const result = await pool.query('SELECT current_database() AS db');

    // Assert — safe check, exposes only the database name (no secrets)
    expect(result.rows[0].db).toBe('leaveflow_test');
  });


  test('GET /api/health returns ok', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
    });
  });

  test('POST /api/auth/login accepts valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ishara@ceylonroots.lk',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(
      'ishara@ceylonroots.lk'
    );
    expect(response.body.user.role).toBe('EMPLOYEE');
  });

  test('POST /api/leave-requests returns 400 for an invalid date range', async () => {
    // Arrange
    const token = await login('ishara@ceylonroots.lk', 'Password123!');

    // Act
    const response = await request(app)
      .post('/api/leave-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        leave_type_id: 1,
        start_date: '2026-06-10',
        end_date: '2026-06-05',
      });

    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/leave-requests returns 401 without a bearer token', async () => {
    // Arrange — intentionally send no Authorization header

    // Act
    const response = await request(app).get('/api/leave-requests');

    // Assert
    expect(response.statusCode).toBe(401);
  });

  test('GET /api/team/requests returns 403 for an employee role', async () => {
    // Arrange — Ishara is an EMPLOYEE, but the route requires MANAGER/HR_ADMIN
    const token = await login('ishara@ceylonroots.lk', 'Password123!');

    // Act
    const response = await request(app)
      .get('/api/team/requests')
      .set('Authorization', `Bearer ${token}`);

    // Assert
    expect(response.statusCode).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  describe('cancellation flow', () => {
    const OWNER = {
      email: 'ishara@ceylonroots.lk',
      password: 'Password123!',
    };
    const MANAGER_ID = 1; // Ruwan, Ishara's manager
    const OTHER_EMPLOYEE_ID = 1002; // a different employee, not the owner

    // Sign a token for identities whose test-DB passwords are not provided.
    // The app verifies against the same JWT secret loaded from .env.test,
    // and the cancel route authorizes purely by the token's id/role.
    function signToken(id, role) {
      return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }

    // Keep each cancellation test independent of the others and of
    // execution order by clearing request/balance state beforehand.
    beforeEach(async () => {
      await pool.query('DELETE FROM leave_balances');
      await pool.query('DELETE FROM leave_requests');
    });

    // Creates a PENDING request via the real API and returns its id.
    // 2026-07-06 is a Monday, so it counts as one working day.
    async function createPendingRequest(token) {
      const response = await request(app)
        .post('/api/leave-requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          leave_type_id: 1,
          start_date: '2026-07-06',
          end_date: '2026-07-06',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('PENDING');

      return response.body.id;
    }

    test('owner can cancel a PENDING request', async () => {
      // Arrange
      const token = await login(OWNER.email, OWNER.password);
      const id = await createPendingRequest(token);

      // Act
      const response = await request(app)
        .delete(`/api/leave-requests/${id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('CANCELLED');
    });

    test('cancelling an APPROVED request returns 409', async () => {
      // Arrange — owner creates it, the manager approves it via the real API
      const ownerToken = await login(OWNER.email, OWNER.password);
      const managerToken = signToken(MANAGER_ID, 'MANAGER');
      const id = await createPendingRequest(ownerToken);

      const approval = await request(app)
        .patch(`/api/leave-requests/${id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ action: 'approve' });

      expect(approval.statusCode).toBe(200);
      expect(approval.body.status).toBe('APPROVED');

      // Act
      const response = await request(app)
        .delete(`/api/leave-requests/${id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      // Assert — existing API behaviour: 409 INVALID_STATE
      expect(response.statusCode).toBe(409);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    test('a non-owner cannot cancel another user\'s request', async () => {
      // Arrange — Ishara owns it; a different employee attempts to cancel it
      const ownerToken = await login(OWNER.email, OWNER.password);
      const otherToken = signToken(OTHER_EMPLOYEE_ID, 'EMPLOYEE');
      const id = await createPendingRequest(ownerToken);

      // Act
      const response = await request(app)
        .delete(`/api/leave-requests/${id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      // Assert
      expect(response.statusCode).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    test('cancelling a non-existent request returns 404', async () => {
      // Arrange — beforeEach cleared leave_requests, so this id cannot exist
      const token = await login(OWNER.email, OWNER.password);

      // Act
      const response = await request(app)
        .delete('/api/leave-requests/999999')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});