# LeaveFlow API Contract (v1)

**Base URL:** `http://localhost:4000/api`

All responses are JSON.

Errors use the following standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error"
  }
}
```

## Authentication

Bearer JWT authentication is required on every endpoint except:

`POST /auth/login`

The client sends the token using:

```text
Authorization: Bearer <jwt>
```

## Endpoints

| Method | Path                  | Who       | Success | Errors        |
| ------ | --------------------- | --------- | ------- | ------------- |
| POST   | `/auth/login`         | Anyone    | 200     | 400, 401      |
| GET    | `/me`                 | Any user  | 200     | 401           |
| GET    | `/leave-requests`     | Owner     | 200     | 401           |
| POST   | `/leave-requests`     | Owner     | 201     | 400, 401, 409 |
| PATCH  | `/leave-requests/:id` | See below | 200     | 400, 403, 404 |
| GET    | `/balances`           | Owner     | 200     | 401           |
| GET    | `/team/requests`      | MANAGER   | 200     | 401, 403      |

## PATCH Leave Request Rules

The request body is:

```json
{
  "action": "approve"
}
```

The possible actions are:

```text
approve
reject
cancel
```

### Approve

Only the requester's manager can approve a leave request.

The request must be in `PENDING` status.

### Reject

Only the requester's manager can reject a leave request.

The request must be in `PENDING` status.

### Cancel

Only the employee who created the request can cancel it.

The request must be in `PENDING` status.

An already `APPROVED`, `REJECTED`, or `CANCELLED` request cannot be cancelled.

## Create Leave Request

### Request

```http
POST /api/leave-requests HTTP/1.1
Host: localhost:4000
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "leave_type_id": 1,
  "start_date": "2026-05-01",
  "end_date": "2026-05-03",
  "reason": "Vesak trip to Kandy with family"
}
```

### Successful Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "id": 42,
  "user_id": 3,
  "leave_type_id": 1,
  "start_date": "2026-05-01",
  "end_date": "2026-05-03",
  "status": "PENDING",
  "created_at": "2026-04-20T09:14:00Z"
}
```

## Validation Error

If the request contains invalid data, the API returns:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "end_date must be on or after start_date"
  }
}
```

## Overlapping Leave Requests

A user cannot create a leave request that overlaps with an existing `PENDING` or `APPROVED` request.

`REJECTED` and `CANCELLED` requests do not prevent a new request.

If an overlap is detected, the API returns:

```http
HTTP/1.1 409 Conflict
Content-Type: application/json
```

```json
{
  "error": {
    "code": "OVERLAPPING_REQUEST",
    "message": "Leave request overlaps with an existing pending or approved request."
  }
}
```

## Half-Day Leave

Leave requests support full-day and half-day leave.

The request can contain a `day_part` field:

```json
{
  "leave_type_id": 1,
  "start_date": "2026-05-01",
  "end_date": "2026-05-01",
  "day_part": "MORNING",
  "reason": "Medical appointment"
}
```

Allowed values are:

```text
FULL_DAY
MORNING
AFTERNOON
```

A full-day request counts as `1` day and a half-day request counts as `0.5` day.

## HTTP Status Codes

| Status | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| 200    | Request successful                                              |
| 201    | Resource created successfully                                   |
| 400    | Invalid request or validation error                             |
| 401    | Authentication required or invalid                              |
| 403    | User is authenticated but not authorized                        |
| 404    | Requested resource does not exist                               |
| 409    | Request conflicts with existing data, such as overlapping leave |

## State Transitions

Leave requests follow this state machine:

```text
             approve
PENDING ----------------> APPROVED
   |
   | reject
   ↓
REJECTED

PENDING
   |
   | cancel
   ↓
CANCELLED
```

Only the following transitions are allowed:

```text
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED
```

## Business Rules

1. Employees can create their own leave requests.
2. Only a requester's manager can approve or reject the request.
3. Employees can cancel only their own `PENDING` requests.
4. Approved requests cannot be cancelled.
5. A user cannot have overlapping `PENDING` or `APPROVED` requests.
6. A leave request cannot exceed the user's available leave balance.
7. The browser must not access the database directly.
8. All business rules are enforced by the API.
9. Leave balances are calculated using the annual allocation and `used_days`.
10. All API errors use the standard `{ error: { code, message } }` format.
