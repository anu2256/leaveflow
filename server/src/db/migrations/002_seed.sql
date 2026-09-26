INSERT INTO leave_types (name, annual_allocation)
VALUES
  ('Annual', 14),
  ('Casual', 7),
  ('Sick', 7);

INSERT INTO users (name, email, password_hash, role, manager_id) VALUES
  ('Ruwan Jayasuriya', 'ruwan@ceylonroots.lk',
   '$2b$10$WuSJHU1NAAAxSGyNuCP9MOYosPhhq.evuU3bTIlZ5QMHoi.rALO1m',
   'MANAGER', NULL),

  ('Ishara Fernando', 'ishara@ceylonroots.lk',
   '$2b$10$WuSJHU1NAAAxSGyNuCP9MOYosPhhq.evuU3bTIlZ5QMHoi.rALO1m',
   'EMPLOYEE', 1),

  ('Dilini Weerasinghe', 'dilini@ceylonroots.lk',
   '$2b$10$WuSJHU1NAAAxSGyNuCP9MOYosPhhq.evuU3bTIlZ5QMHoi.rALO1m',
   'HR_ADMIN', NULL);