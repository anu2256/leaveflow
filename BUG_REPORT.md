# Bug Report

## BUG-001 — Leave duration incorrectly includes weekends and holidays

| Field | Value |
| --- | --- |
| Bug ID | BUG-001 |
| Title | Leave duration incorrectly includes weekends and holidays |
| Severity | High |
| Priority | High |
| Area | Leave request validation / leave balance |
| Status | Fixed |
| Regression test | Added |

## Description

A leave request's duration was previously calculated with an inclusive
calendar-day formula, `floor((end - start) / day) + 1`. Because it counted
calendar days rather than working days, weekends and configured holidays that
fell within the date range were incorrectly included in the leave duration.
This affected both leave-request validation and the leave balance deducted on
approval.

## Steps to Reproduce

1. Create a leave request covering five working days.
2. Approve the leave request.
3. Check the employee leave balance.

## Expected Result

The employee's balance should decrease by exactly 5 working days.

## Actual Result

The previous implementation counted every calendar day in the range, so weekends
and configured holidays were included in the leave duration, inflating the number
of days charged against the employee's balance.

## Root Cause

The leave duration was computed with an inclusive calendar-day formula,
`floor((end - start) / day) + 1`, which counts calendar days. Leave duration must
instead count working days inclusively while excluding weekends and configured
holidays; the original calculation did neither exclusion.

## Fix

The `leaveDays` helper now calculates the inclusive working-day duration and
excludes weekends and holidays, so only actual working days within the range are
counted for both validation and balance deduction.

## Verification

Automated Jest tests now verify working-day calculations — including a
five-working-day range, weekend exclusion, and a holiday exclusion (Vesak) — and
the test suite passes.
