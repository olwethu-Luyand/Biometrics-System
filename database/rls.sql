-- ============================================================
-- PrimeOak Solutions — Row Level Security (RLS) setup
-- Run this in the Supabase SQL editor.
-- Scope: allow anon (publishable key) READ on users roster data
--        and attendance; deny everything else until auth is wired.
-- ============================================================

-- ── Enable RLS on all tables ────────────────────────────────
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- ── Policies ─────────────────────────────────────────────────
-- Anonymous users (publishable key, no login yet) may read the
-- employee roster and attendance history.
CREATE POLICY "anon_read_users" ON users
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_attendance" ON attendance
  FOR SELECT TO anon USING (true);

-- Fully authenticated users (after Supabase Auth integration)
-- can read the same data.
CREATE POLICY "auth_read_users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_read_attendance" ON attendance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_read_webauthn" ON webauthn_credentials
  FOR SELECT TO authenticated USING (true);

-- ── Deny-by-default for everything else ──────────────────────
-- With RLS enabled and no INSERT/UPDATE/DELETE policies,
-- anon/authenticated writes are rejected with 403/42501.
-- (users can insert via Supabase Auth signup only through
--  a dedicated signup RPC/trigger when we build it.)

-- ════════════════════════════════════════════════════════════
-- WRITE POLICIES (test phase)
-- The app does not use Supabase Auth yet, so writes go through
-- the publishable key as the anon role.
-- SECURITY NOTE: these are wide-open test policies. Once
-- Supabase Auth is wired, replace USING/WITH CHECK with
-- (auth.uid() IS NOT NULL) or per-user checks.
-- ════════════════════════════════════════════════════════════
CREATE POLICY "anon_insert_users" ON users
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_attendance" ON attendance
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_attendance" ON attendance
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_reports" ON reports
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_reports" ON reports
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_payroll" ON payroll
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_payroll" ON payroll
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_payroll" ON payroll
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_payroll" ON payroll
  FOR DELETE TO anon USING (true);
CREATE POLICY "anon_update_users" ON users
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_webauthn" ON webauthn_credentials
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_webauthn" ON webauthn_credentials
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_audit_logs" ON audit_logs
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_audit_logs" ON audit_logs
  FOR SELECT TO anon USING (true);

CREATE POLICY "auth_insert_users" ON users
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_read_reports" ON reports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_payroll" ON payroll
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_payroll" ON payroll
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_payroll" ON payroll
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_payroll" ON payroll
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_update_users" ON users
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_webauthn" ON webauthn_credentials
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_read_webauthn" ON webauthn_credentials
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_attendance" ON attendance
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_attendance" ON attendance
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_reports" ON reports
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_audit_logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_read_audit_logs" ON audit_logs
  FOR SELECT TO authenticated USING (true);

-- ── Sanity checks (should return nothing) ────────────────────
-- SELECT * FROM pg_policies WHERE tablename = 'users';
