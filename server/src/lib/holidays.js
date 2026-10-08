'use strict';

const pool = require('../db/pool');

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

/**
 * Query the public_holidays table and return holiday dates as 'YYYY-MM-DD'
 * strings, ready to pass into leaveDays(). Optionally filtered by year.
 *
 * @param {number|string} [year]
 * @returns {Promise<string[]>}
 */
async function getHolidays(year) {
  const result = year
    ? await pool.query(
        'SELECT holiday_date FROM public_holidays WHERE year = $1 ORDER BY holiday_date',
        [year]
      )
    : await pool.query(
        'SELECT holiday_date FROM public_holidays ORDER BY holiday_date'
      );

  return result.rows.map((r) => {
    const d = r.holiday_date;
    // node-postgres returns DATE as a local-midnight Date; read its calendar
    // components so the day never shifts due to timezone.
    if (d instanceof Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return String(d).slice(0, 10);
  });
}

module.exports = { HOLIDAYS_2026, getHolidays };
