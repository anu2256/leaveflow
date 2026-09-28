INSERT INTO leave_types (name, annual_allocation)
VALUES
  ('Annual', 14),
  ('Casual', 7),
  ('Sick', 7);

INSERT INTO users (name, email, password_hash, role, manager_id) VALUES
  ('Ruwan Jayasuriya', 'ruwan@ceylonroots.lk',
   '$2b$10$rbXUefpfBGT7tF.9jyCQuevpn8cSwWcOdEvXE0rmGnJT.qmuZ7dUa',
   'MANAGER', NULL),

  ('Ishara Fernando', 'ishara@ceylonroots.lk',
   '$2b$10$rbXUefpfBGT7tF.9jyCQuevpn8cSwWcOdEvXE0rmGnJT.qmuZ7dUa',
   'EMPLOYEE', 1),

  ('Dilini Weerasinghe', 'dilini@ceylonroots.lk',
   '$2b$10$rbXUefpfBGT7tF.9jyCQuevpn8cSwWcOdEvXE0rmGnJT.qmuZ7dUa',
   'HR_ADMIN', NULL);