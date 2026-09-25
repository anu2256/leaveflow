LeaveFlow — SRS v0.1

Customer: Ceylon Roots (Pvt) Ltd
Stakeholder: Nadeesha Perera, HR Manager
Purpose: Replace email, WhatsApp, and spreadsheet-based leave tracking for approximately 60 employees.

---

1. Stakeholders

Stakeholder| Needs / Interests
Employees| Apply for leave, cancel pending requests, view balances and request status
Managers / Team Leads| Approve or reject their team's leave requests and view team leave
HR / HR Admin| Maintain oversight, manage leave policies and monitor requests
Finance| Generate year-end leave reports without manual spreadsheet work
Directors| Ensure policy compliance and keep the system simple and cost-effective

---

2. Scope

In Scope

- Employee login
- Leave applications
- Leave balance checking
- Leave approval and rejection
- Cancellation of pending requests
- Request status tracking
- Email notifications
- HR oversight
- Leave reporting
- Responsive web interface

Out of Scope — Version 1

- Payroll processing
- WhatsApp integration
- Native mobile application

A responsive web application will be used instead of a native mobile application.

---

3. User Stories

US-1 — Employee Login

As an employee,
I want to log in with my email and password,
so that only I can access and manage my leave information.

Priority: Must Have

---

US-2 — Apply for Leave

As an employee,
I want to apply for leave by selecting the leave type, dates and reason,
so that my leave requests are recorded in the system instead of WhatsApp or email.

Priority: Must Have

---

US-3 — View Leave Balance

As an employee,
I want to see my remaining balance for each leave type,
so that I know how many days I have available.

Priority: Must Have

---

US-4 — Approve or Reject Leave

As a manager,
I want to approve or reject pending leave requests from my team,
so that leave decisions can be recorded and processed efficiently.

Priority: Must Have

Note: The final approval workflow is pending clarification from HR.

---

US-5 — Cancel Pending Request

As an employee,
I want to cancel my leave request while it is still pending,
so that I can change my plans without requiring HR intervention.

Priority: Must Have

---

US-6 — Configure Leave Types

As an HR administrator,
I want to configure leave types and annual allocations,
so that leave policies can be updated without developer involvement.

Priority: Could Have

---

US-7 — Team Leave Calendar

As a manager,
I want to view my team's approved leave on a calendar,
so that I can identify overlapping leave and plan team availability.

Priority: Could Have

---

US-8 — Leave Decision Notification

As an employee,
I want to receive an email when my leave request is approved or rejected,
so that I do not have to repeatedly check the system.

Priority: Should Have

---

US-9 — HR Overview

As an HR administrator,
I want to view all leave requests across the company,
so that I can maintain company-wide oversight.

Priority: Should Have

---

US-10 — Request Status

As an employee,
I want to see the status of my leave requests,
so that I always know whether a request is pending, approved, rejected or cancelled.

Priority: Must Have

---

4. Finance Reporting User Stories

US-11 — Generate Leave Reports

As a Finance user,
I want to generate leave reports for employees and leave types,
so that I can prepare year-end reports without manually creating spreadsheets.

Priority: Should Have

Acceptance Criteria

Given approved leave records exist for the selected year,
When Finance generates the annual leave report,
Then the system displays employee leave information including leave type and days taken.

---

US-12 — Export Leave Report

As a Finance user,
I want to export the annual leave report,
so that I can use it for finance and payroll-related reporting.

Priority: Should Have

Acceptance Criteria

Given a leave report has been generated,
When Finance selects the export option,
Then the system produces a downloadable report containing the selected leave information.

---

US-13 — Filter Leave Reports

As a Finance user,
I want to filter leave reports by employee, leave type and date range,
so that I can quickly find the information required for reporting.

Priority: Could Have

Acceptance Criteria

Given multiple leave records exist,
When Finance selects a year and leave type,
Then the system displays only records matching those filters.

---

5. Acceptance Criteria

US-2 — Apply for Leave

Scenario 1 — Successful Application

Given I am logged in as an employee with 10 annual leave days remaining,

When I submit an annual leave request for 3 working days with a reason,

Then the request is saved with status "PENDING",

And my available annual balance shows 7 days.

Scenario 2 — Insufficient Balance

Given my remaining annual leave balance is 2 days,

When I request 5 annual leave days,

Then the request is rejected,

And the system displays an "Insufficient balance" message.

---

US-3 — View Leave Balance

Scenario — Display Remaining Balance

Given the yearly allocations are:

- Annual Leave = 14 days
- Casual Leave = 7 days
- Sick Leave = 7 days

And I have already taken 4 approved annual leave days,

When I open the balance page,

Then I see:

- Annual Leave = 10 days remaining
- Casual Leave = 7 days remaining
- Sick Leave = 7 days remaining

And pending requests are shown as reserved and are not treated as approved leave.

---

US-4 — Approve or Reject Leave

Scenario 1 — Approve Request

Given I am logged in as a manager,

And my team member Ishara has a "PENDING" leave request,

When I approve the request,

Then the request status becomes "APPROVED",

And the system records my user ID and the approval timestamp,

And Ishara is notified.

Scenario 2 — Final Decision

Given a leave request is already "APPROVED",

When a user attempts to approve or reject it again,

Then the action is refused.

---

6. MoSCoW Prioritisation

Must Have

- US-1 — Employee Login
- US-2 — Apply for Leave
- US-3 — View Leave Balance
- US-4 — Approve / Reject Leave
- US-5 — Cancel Pending Request
- US-10 — View Request Status

Should Have

- US-8 — Email Notifications
- US-9 — HR Overview
- US-11 — Generate Leave Reports
- US-12 — Export Leave Reports

Could Have

- US-6 — Configure Leave Types
- US-7 — Team Leave Calendar
- US-13 — Filter Leave Reports

Won't Have — Version 1

- Payroll processing
- WhatsApp integration
- Native mobile application

---

7. Clarifying Questions

Q1 — Approval Workflow

You mentioned that team leads should approve their employees' leave, but you also said that every approval must come to HR first.

Which process should the system follow?

- Manager approves only
- HR approves only
- Manager approves first, then HR gives final approval

Could you walk us through the last real leave approval step by step?

Status: Blocking question.

Q2 — Leave Carry Forward

Do unused leave days carry forward to the next year, or do they expire on December 31?

Q3 — Working Days

Are weekends and public holidays, such as Poya days, excluded when calculating the number of leave days?

Q4 — Sick Leave

Can employees submit sick leave requests after they have already been absent?

Q5 — Finance Report

Could you provide last year's manually prepared leave report so that the new system can produce the information Finance already uses?

---

8. Non-Functional Requirements

NFR-1 — Authentication

All system features must require user authentication.

Passwords must be securely hashed and must never be stored as plain text.

NFR-2 — Role-Based Access

The system must support the following roles:

- "EMPLOYEE"
- "MANAGER"
- "HR_ADMIN"
- "FINANCE"

Each role must only access features and information permitted for that role.

NFR-3 — Audit Trail

Every approval and rejection must record:

- User who performed the action
- Date and time
- Action performed

NFR-4 — Mobile Responsiveness

The system must be usable on mobile devices with a screen width of approximately 360px.

NFR-5 — System Scale

The system must support approximately 60 employees and a few hundred leave requests per year.

The initial system does not require complex clustering or large-scale infrastructure.

---

9. Leave Rules

Rule 1 — Annual Allocation

Each employee receives:

- Annual Leave: 14 days
- Casual Leave: 7 days
- Sick Leave: 7 days

Rule 2 — Request Lifecycle

A leave request follows:

"PENDING → APPROVED"

or

"PENDING → REJECTED"

An employee can cancel a request while it is still pending:

"PENDING → CANCELLED"

Rule 3 — Pending Requests

Pending requests must not be treated as approved leave.

They may be shown as reserved when calculating available balance.

---

10. Additional Requirements from Customer Follow-Up

Nadeesha later provided the following additional requirements.

US-14 — Medical Certificate

As an HR administrator,
I want employees who take more than three consecutive sick days to provide a medical certificate,
so that sick leave can be verified according to company policy.

Acceptance Criteria

Given an employee requests more than three consecutive sick leave days,

When the request is submitted,

Then the system requires a medical certificate before HR can approve the request.

---

US-15 — Medical Certificate Storage

As an HR administrator,
I want the medical certificate to be stored with the relevant leave request,
so that I can verify the document before approving the leave.

Acceptance Criteria

Given a sick leave request requires a medical certificate,

When the employee uploads the certificate,

Then the certificate is stored and linked to that leave request.

---

Rule 4 — Company Holiday

Employees must not be able to book annual leave during the company's scheduled Sinhala and Tamil New Year shutdown period because those dates are already company holidays.

Acceptance Criteria

Given a date falls within the company holiday period,

When an employee tries to submit annual leave for that date,

Then the system prevents the request and informs the employee that the date is a company holiday.

---

11. Open Requirements

The following requirements require confirmation before final development:

1. Final approval workflow — Manager → HR or another process.
2. Leave carry-forward policy.
3. Weekend and public holiday calculation rules.
4. Sick leave retrospective application.
5. Exact Finance report format.
6. Exact Sinhala and Tamil New Year shutdown dates.
7. Medical certificate file types and maximum file size.

---

12. Basic Wireframes

Employee — Apply for Leave

+----------------------------------+
|          APPLY FOR LEAVE         |
+----------------------------------+

Leave Type
[ Annual Leave ▼ ]

Start Date
[ DD / MM / YYYY ]

End Date
[ DD / MM / YYYY ]

Working Days: 3

Available Balance: 10 days

Reason
[                                ]
[                                ]

[       SUBMIT REQUEST           ]

Current Status: -

Manager — Pending Approvals

+--------------------------------------+
|          PENDING APPROVALS           |
+--------------------------------------+

Employee: Ishara Perera
Leave Type: Annual Leave
Dates: 15 Sep - 17 Sep
Days: 3
Remaining Balance: 8 days

Team Availability:
QC Team - 2 employees already on leave

Reason:
Family event

[ REJECT ]              [ APPROVE ]

The manager's screen should provide enough information to make a decision quickly, including the employee, leave dates, leave type, requested days, remaining balance, reason and relevant team availability.

---

13. SRS Status

Version: v0.1
Status: Draft
Customer: Ceylon Roots (Pvt) Ltd
Primary Contact: Nadeesha Perera — HR Manager

The requirements document remains a draft until the outstanding clarification questions are answered, especially the approval workflow.

Key principle: Requirements should be clear, testable and agreed before development begins.