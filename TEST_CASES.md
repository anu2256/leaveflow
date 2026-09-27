# LeaveFlow — Manual Test Cases

| ID | Test Case | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- |
| TC-01 | Employee login | Enter valid employee email and password and click Sign In. | Employee dashboard is displayed. | PASS |
| TC-02 | Invalid login | Enter an incorrect password and click Sign In. | Login error is displayed. | PASS |
| TC-03 | Apply for leave | Select a leave type, valid dates, and a reason, then submit. | Leave request is created with PENDING status. | PASS |
| TC-04 | Manager approves leave | Login as manager, open a pending request, and approve it. | Request status changes to APPROVED. | PASS |
| TC-05 | Employee cancels pending leave | Login as employee and cancel a PENDING request. | Request status changes to CANCELLED. | PASS |
