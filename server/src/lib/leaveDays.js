'use strict';

/**
 * Convert a date input to a UTC-midnight millisecond value representing its
 * calendar day, independent of the host timezone.
 *
 * - 'YYYY-MM-DD' strings are read by their digits (as the API receives them).
 * - Date objects (e.g. a node-postgres DATE column, which arrives as local
 *   midnight) are read by their local calendar components.
 *
 * Returns null when the value cannot be interpreted as a date.
 */
function parseDateOnly(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (match) {
      return Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      );
    }
  }

  return null;
}

/**
 * Count the number of working leave days between two dates.
 *
 * - The range is inclusive of both start and end.
 * - Saturdays and Sundays are excluded.
 * - Any date in `holidays` (an array of 'YYYY-MM-DD' strings) is excluded.
 * - Supports half-day leave calculations (dayPart = 'AM' or 'PM').
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @param {string[]} [holidays]
 * @param {string} [dayPart='FULL'] - 'FULL', 'AM', or 'PM'
 * @returns {number} the number of working leave days (e.g. 0.5, 1, 2)
 * @throws {Error} 'Invalid date' when a date cannot be parsed
 * @throws {Error} 'end_date must be on or after start_date' when end < start
 * @throws {Error} 'Half-day requests must have matching start and end dates' when dayPart is AM/PM and start != end
 */
function leaveDays(startDate, endDate, holidays = [], dayPart = 'FULL') {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (start === null || end === null) {
    throw new Error('Invalid date');
  }

  if (end < start) {
    throw new Error('end_date must be on or after start_date');
  }

  if ((dayPart === 'AM' || dayPart === 'PM') && start !== end) {
    throw new Error('Half-day requests must have matching start and end dates');
  }

  const holidaySet = new Set(
    (holidays || []).map((holiday) => {
      if (holiday instanceof Date) {
        return holiday.toISOString().slice(0, 10);
      }
      return typeof holiday === 'string' ? holiday.trim().slice(0, 10) : String(holiday);
    })
  );

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  let workingDays = 0;

  for (let time = start; time <= end; time += MS_PER_DAY) {
    const day = new Date(time);
    const dayOfWeek = day.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const iso = day.toISOString().slice(0, 10);

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend && !holidaySet.has(iso)) {
      workingDays += 1;
    }
  }

  if (dayPart === 'AM' || dayPart === 'PM') {
    return workingDays > 0 ? 0.5 : 0;
  }

  return workingDays;
}

module.exports = { leaveDays };