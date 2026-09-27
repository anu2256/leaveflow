'use strict';

const { leaveDays } = require('../src/lib/leaveDays');
const { HOLIDAYS_2026 } = require('../src/lib/holidays');

describe('leaveDays', () => {
  test('counts a full working week (Mon-Fri) as 5 days', () => {
    // 2026-06-01 is a Monday, 2026-06-05 is a Friday
    expect(leaveDays('2026-06-01', '2026-06-05')).toBe(5);
  });

  test('counts a single working day as 1 day', () => {
    // 2026-06-01 is a Monday
    expect(leaveDays('2026-06-01', '2026-06-01')).toBe(1);
  });

  test('excludes the weekend for a Friday-to-Monday range', () => {
    // Fri 2026-06-05 -> Mon 2026-06-08: Sat/Sun excluded, leaves Fri + Mon
    expect(leaveDays('2026-06-05', '2026-06-08')).toBe(2);
  });

  test('throws when the end date is before the start date', () => {
    expect(() => leaveDays('2026-06-05', '2026-06-01')).toThrow(
      'end_date must be on or after start_date'
    );
  });

  test('excludes a supplied holiday from the working-day count', () => {
    // Mon 2026-06-01 -> Wed 2026-06-03 is 3 working days; excluding
    // Tue 2026-06-02 as a holiday leaves 2
    expect(leaveDays('2026-06-01', '2026-06-03', ['2026-06-02'])).toBe(2);
  });

  test('excludes Vesak Poya (2026-05-01) using the project holiday list', () => {
    // Thu 2026-04-30 -> Mon 2026-05-04. Weekends (Sat/Sun) are already
    // excluded, leaving Thu, Fri, Mon = 3 working days. Vesak falls on
    // Fri 2026-05-01, so passing HOLIDAYS_2026 drops it to 2.
    expect(HOLIDAYS_2026).toContain('2026-05-01');
    expect(leaveDays('2026-04-30', '2026-05-04')).toBe(3);
    expect(leaveDays('2026-04-30', '2026-05-04', HOLIDAYS_2026)).toBe(2);
  });
});
