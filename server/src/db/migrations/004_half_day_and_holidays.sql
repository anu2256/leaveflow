-- Public holidays table (managed by HR_ADMIN)
CREATE TABLE public_holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL
);

-- Half-day support on leave requests
ALTER TABLE leave_requests
  ADD COLUMN day_part VARCHAR(10) DEFAULT 'FULL'
    CHECK (day_part IN ('FULL', 'AM', 'PM'));

-- Seed sample Sri Lankan 2026 public holidays
INSERT INTO public_holidays (holiday_date, name, year) VALUES
  ('2026-04-13', 'Day before Sinhala & Tamil New Year', 2026),
  ('2026-04-14', 'Sinhala & Tamil New Year Day', 2026),
  ('2026-05-01', 'Vesak Full Moon Poya Day', 2026),
  ('2026-05-02', 'Day following Vesak Full Moon Poya Day', 2026);
