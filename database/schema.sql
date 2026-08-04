-- ============================================================
-- PrimeOak Solutions — HR System Database
-- PostgreSQL script: schema + seed data
-- Matches the frontend mock API data model (Frontend/src/lib/mock.ts)
--
-- Usage:
--   psql -U postgres -d primeoak -f database/schema.sql
-- ============================================================

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS webauthn_credentials;
DROP TABLE IF EXISTS users;

-- ── Users (login accounts, one per employee) ────────────────
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  employee_id   VARCHAR(8)  UNIQUE NOT NULL CHECK (employee_id ~ '^\d{8}$'),
  name          VARCHAR(100) NOT NULL,
  surname       VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'hr', 'employee')),
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── WebAuthn credentials (passkeys / fingerprints) ───────────
CREATE TABLE webauthn_credentials (
  id            SERIAL PRIMARY KEY,
  user_id       INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT        UNIQUE NOT NULL,
  public_key    TEXT        NOT NULL,             -- base64url-encoded
  counter       BIGINT      NOT NULL DEFAULT 0,
  device_name   VARCHAR(100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Attendance (clock in/out records) ───────────────────────
CREATE TABLE attendance (
  id          SERIAL PRIMARY KEY,
  employee_id VARCHAR(8)  NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
  date        DATE        NOT NULL,
  clock_in    TIME,
  clock_out   TIME,
  hours       NUMERIC(4,1),
  status      VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  UNIQUE (employee_id, date)
);

-- ── Reports (employee -> HR) ────────────────────────────────
CREATE TABLE reports (
  id            SERIAL PRIMARY KEY,
  employee_id   VARCHAR(8)  NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
  employee_name VARCHAR(200) NOT NULL,
  reason        VARCHAR(20) NOT NULL CHECK (reason IN ('late', 'sick', 'other')),
  date          DATE,
  note          TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'Open',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Payroll ─────────────────────────────────────────────────
CREATE TABLE payroll (
  id            SERIAL PRIMARY KEY,
  employee_id   VARCHAR(8)  NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
  pay_start     DATE        NOT NULL,
  pay_end       DATE        NOT NULL,
  hours         NUMERIC(6,1),
  overtime      NUMERIC(6,1),
  gross_pay     NUMERIC(10,2),
  deduction     NUMERIC(10,2),
  net_pay       NUMERIC(10,2),
  payment_date  DATE,
  status        VARCHAR(20) NOT NULL DEFAULT 'Pending'
);

-- ── Audit logs ──────────────────────────────────────────────
CREATE TABLE audit_logs (
  id         SERIAL PRIMARY KEY,
  actor      VARCHAR(200) NOT NULL,
  action     VARCHAR(100) NOT NULL,
  target     VARCHAR(200),
  log_date   DATE NOT NULL,
  log_time   TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- SEED DATA (matches the demo accounts in the mock API)
-- NOTE: password hashes are placeholders — replace them with
-- real bcrypt hashes, e.g. for bcrypt cost 12:
--   password 'admin123' -> $2b$12$...
--   password 'hr123'    -> $2b$12$...
--   password 'emp123'   -> $2b$12$...
-- ════════════════════════════════════════════════════════════

INSERT INTO users (employee_id, name, surname, email, role, password_hash) VALUES
  ('10000001', 'Olwethu',   'Xaba',      'admin@primeoak.com',     'admin',    '$2b$12$REPLACE_WITH_BCRYPT_HASH_admin123'),
  ('00003333', 'Bokang',    'Ngwetjana', 'bokang@primeoak.com',    'hr',       '$2b$12$REPLACE_WITH_BCRYPT_HASH_hr123'),
  ('00002222', 'Boitumelo', 'Magashula', 'boitumelo@primeoak.com', 'employee', '$2b$12$REPLACE_WITH_BCRYPT_HASH_emp123'),
  ('00001111', 'Mooketsi',  'Mogale',    'mooketsi@primeoak.com',  'employee', '$2b$12$REPLACE_WITH_BCRYPT_HASH_emp123'),
  ('00004444', 'Paballo',   'Diphoko',   'paballo@primeoak.com',   'employee', '$2b$12$REPLACE_WITH_BCRYPT_HASH_emp123'),
  ('00005555', 'Bongiwe',   'Siboza',    'bongiwe@primeoak.com',   'employee', '$2b$12$REPLACE_WITH_BCRYPT_HASH_emp123'),
  ('00006666', 'Junior',    'Mphefo',    'junior@primeoak.com',    'employee', '$2b$12$REPLACE_WITH_BCRYPT_HASH_emp123');

INSERT INTO attendance (employee_id, date, clock_in, clock_out, hours, status) VALUES
  ('00002222', '2026-08-04', '08:02', '16:30', 8.5, 'Present'),
  ('00002222', '2026-08-03', '07:55', '16:12', 8.3, 'Present'),
  ('00002222', '2026-07-31', '08:31', NULL,    NULL, 'Late'),
  ('00001111', '2026-08-04', '08:10', '16:00', 7.8, 'Present'),
  ('00003333', '2026-08-04', '07:48', '17:02', 9.2, 'Present');

INSERT INTO reports (employee_id, employee_name, reason, date, note, status) VALUES
  ('00002222', 'Boitumelo Magashula', 'late', '2026-07-31', 'Traffic on the N4', 'Open');

INSERT INTO payroll (employee_id, pay_start, pay_end, hours, overtime, gross_pay, deduction, net_pay, payment_date, status) VALUES
  ('00003333', '2026-07-10', '2026-07-31', 75.0, 2.0, 1750.00, 50.00, 1700.00, '2026-07-31', 'Pending'),
  ('00001111', '2026-07-10', '2026-07-31', 80.0, 0.0, 1600.00, 40.00, 1560.00, '2026-07-31', 'Paid');

INSERT INTO audit_logs (actor, action, target, log_date, log_time) VALUES
  ('Bokang Ngwetjana', 'Registered employee', 'Paballo Diphoko', '2026-08-03', '09:12'),
  ('Bokang Ngwetjana', 'Enrolled biometric',  'Paballo Diphoko', '2026-08-03', '09:13'),
  ('Mooketsi Mogale',  'Updated payroll',     '00002222',        '2026-08-03', '08:47'),
  ('Boitumelo Magashula', 'Signed in',        'Fingerprint',     '2026-08-03', '07:55');

-- Helpful views
CREATE OR REPLACE VIEW employee_roster AS
  SELECT employee_id, name, surname, email, role
  FROM users
  ORDER BY id;

CREATE OR REPLACE VIEW daily_attendance AS
  SELECT a.employee_id, u.name || ' ' || u.surname AS full_name,
         a.date, a.clock_in, a.clock_out, a.hours, a.status
  FROM attendance a
  JOIN users u ON u.employee_id = a.employee_id
  ORDER BY a.date DESC;
