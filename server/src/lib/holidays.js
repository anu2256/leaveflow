'use strict';

/**
 * Sri Lankan 2026 public / Poya holidays observed by LeaveFlow.
 *
 * Format: an array of 'YYYY-MM-DD' strings, ready to pass straight into
 * leaveDays(start, end, holidays). Dates listed here are excluded from
 * the working-day count (in addition to weekends).
 *
 * These are the dates the project references directly:
 *  - the Sinhala & Tamil New Year shutdown (requirement Rule 4), and
 *  - Vesak (the "Vesak trip" example in docs/api.md).
 */
const HOLIDAYS_2026 = [
  '2026-04-13', // Day before Sinhala & Tamil New Year Day
  '2026-04-14', // Sinhala & Tamil New Year Day
  '2026-05-01', // Vesak Full Moon Poya Day
  '2026-05-02', // Day following Vesak Full Moon Poya Day
];

module.exports = { HOLIDAYS_2026 };
