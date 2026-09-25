LeaveFlow Design Document v1

Date: 2026-09
Project: LeaveFlow
Author: Gayani Anuththara

1. Context

Ceylon Roots (Pvt) Ltd has approximately 60 employees and currently manages leave requests using email, WhatsApp, and spreadsheets.

This can cause problems such as lost requests, difficulty checking leave balances, and manual tracking.

LeaveFlow will provide a centralized system where employees can apply for leave, managers can approve or reject requests, and employees can view their leave balances and request status.

The requirements are documented in the SRS from Phase 1.

2. Decisions

D1 — Three-Tier Architecture

LeaveFlow will use a three-tier architecture:

- React SPA — frontend
- Express API — backend
- PostgreSQL — database

For the initial v0 implementation, a single Express server with SQLite will be used to demonstrate the system end-to-end.

The browser will communicate with the API using HTTP and JSON. The API will be the only component that communicates directly with the database.

D2 — Database Design

The system will use four main tables:

- "users"
- "leave_types"
- "leave_requests"
- "leave_balances"

The "leave_balances" table will contain a "year" column because leave allocations reset each year while previous years' records need to remain available for history and auditing.

The system will store "used_days" instead of "remaining_days".

Remaining days will be calculated as:

"annual_allocation - used_days"

This avoids storing duplicate information that could become inconsistent.

D3 — Leave Request State Machine

A leave request can have four states:

- "PENDING"
- "APPROVED"
- "REJECTED"
- "CANCELLED"

Allowed transitions are:

PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED

The manager can approve or reject a request.

The employee who created the request can cancel it while it is still "PENDING".

An "APPROVED", "REJECTED", or "CANCELLED" request cannot be cancelled.

D4 — REST API

The system will provide a REST API under "/api".

The API will use HTTP methods such as:

- "GET" for retrieving data
- "POST" for creating data
- "PATCH" for partially updating data

All responses will use JSON.

Errors will use one standard format:

{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error"
  }
}

Authentication will use a Bearer JWT.

D5 — Half-Day Leave

Half-day leave will be supported using a "day_part" field in the "leave_requests" table.

Possible values are:

- "FULL_DAY"
- "MORNING"
- "AFTERNOON"

This approach was selected because it clearly represents which part of the day the employee is requesting.

The system can calculate the leave amount as:

- Full day = "1" day
- Half day = "0.5" day

"used_days" will continue to store the total number of days used.

D6 — Overlapping Leave Requests

A user cannot create a leave request that overlaps with an existing "PENDING" or "APPROVED" request.

If an overlap is detected, the API will return:

409 Conflict

with the error code:

OVERLAPPING_REQUEST

"REJECTED" and "CANCELLED" requests will not prevent a new request.

3. Alternatives Considered

A1 — Continue Using Spreadsheets and Scripts

Rejected because: spreadsheets do not provide the required centralized access control, workflow, and reliable request tracking.

A2 — Store Remaining Days

Rejected because: remaining days can be calculated from the annual allocation and used days. Storing both values could cause inconsistent data.

A3 — Use "is_approved" Boolean

Rejected because: a Boolean value cannot properly represent all required states such as "PENDING", "APPROVED", "REJECTED", and "CANCELLED".

A4 — Store Half-Days Only Using Decimal "used_days"

Rejected in favour of "day_part": allowing only "used_days = 0.5" does not clearly describe which part of the day was requested. The "day_part" field makes the request itself explicit while "used_days" continues to represent the calculated amount used.

A5 — Add Microservices, Queues, and Caching

Rejected for the current system: Ceylon Roots has approximately 60 employees, so a simple three-tier architecture is sufficient. Additional infrastructure can be considered if the system's requirements grow significantly.

4. Risks

R1 — System Scale

The current system is designed for approximately 60 employees. We will avoid unnecessary complexity such as microservices, message queues, and caching.

This decision can be reviewed if the system expands to a significantly larger number of users or multiple companies.

R2 — Overlapping Requests

The system will prevent overlapping PENDING and APPROVED requests for the same employee.

Further clarification may be required from the HR manager for special cases such as changes to an existing request.

R3 — Leave Balance Updates

Leave balance updates must happen through the API and not directly from the browser.

Approval and balance updates should be handled carefully so that the request status and "used_days" remain consistent.

5. Architecture

+----------------------+
|      React SPA       |
|      Frontend        |
+----------+-----------+
           |
       HTTP + JSON
           |
           ↓
+----------------------+
|     Express API      |
| Auth + Business Rules|
+----------+-----------+
           |
          SQL
           |
           ↓
+----------------------+
|     PostgreSQL       |
|   Database / Truth   |
+----------------------+

The browser does not connect directly to PostgreSQL.

Business rules such as manager authorization, leave balance validation, request status transitions, and overlap checking are handled by the API.