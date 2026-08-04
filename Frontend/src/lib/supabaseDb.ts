import { supabase } from './supabase';
import { getStoredUser } from './api';
import type { MockAttendance } from './mock';

const ROLE_KEY: Record<string, string> = { Employee: 'employee', 'HR Manager': 'hr', Admin: 'admin' };

const HOURLY_RATE = 25;
const OVERTIME_RATE_MULTIPLIER = 1.5;
const DEDUCTION_RATE = 0.05;
const STANDARD_WEEKLY_HOURS = 40;

export interface PayrollRow {
  id: number;
  employee_id: string;
  pay_start: string;
  pay_end: string;
  hours: number;
  overtime: number;
  gross_pay: number;
  deduction: number;
  net_pay: number;
  status: string;
}

export interface EmployeePayload {
  employeeId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  password: string;
}

interface AttendanceRow {
  id: number;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours: number | null;
  status: string;
}

function toMockAttendance(row: AttendanceRow): MockAttendance {
  return {
    id: `a${row.id}`,
    employeeId: row.employee_id,
    date: new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    clockIn: row.clock_in ? row.clock_in.slice(0, 5) : '',
    clockOut: row.clock_out ? row.clock_out.slice(0, 5) : null,
    hours: row.hours !== null && row.hours !== undefined ? `${row.hours} Hrs` : 'Pending',
    status: row.status as MockAttendance['status'],
  };
}

export async function logAudit(action: string, target: string): Promise<void> {
  if (!supabase) return;
  const actor = getStoredUser()?.fullName ?? 'Unknown';
  const now = new Date();
  const { error } = await supabase.from('audit_logs').insert({
    actor,
    action,
    target,
    log_date: now.toISOString().slice(0, 10),
    log_time: now.toTimeString().slice(0, 8),
  });
  if (error) console.warn('Audit log insert failed:', error.message);
}

export async function insertEmployee(payload: EmployeePayload): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.from('users').insert({
    employee_id: payload.employeeId,
    name: payload.name,
    surname: payload.surname,
    email: payload.email,
    role: ROLE_KEY[payload.role] ?? 'employee',
    password_hash: `$2b$12$placeholder_${payload.password}`,
  });
  if (error) throw new Error(error.message);
  await logAudit('Registered employee', `${payload.name} ${payload.surname} (${payload.employeeId})`);
}

export async function clockIn(employeeId: string): Promise<MockAttendance> {
  if (!supabase) throw new Error('Supabase is not configured');
  const now = new Date();
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      employee_id: employeeId,
      date: now.toISOString().slice(0, 10),
      clock_in: now.toTimeString().slice(0, 8),
      clock_out: null,
      hours: null,
      status: 'Present',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  const record = toMockAttendance(data as AttendanceRow);
  await logAudit('Clocked in', record.employeeId);
  return record;
}

export async function clockOut(employeeId: string): Promise<MockAttendance> {
  if (!supabase) throw new Error('Supabase is not configured');
  const now = new Date();
  const { data: open, error: selectError } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .is('clock_out', null)
    .limit(1);
  if (selectError) throw new Error(selectError.message);
  if (!open || open.length === 0) throw new Error('You have not clocked in yet');

  const row = open[0] as AttendanceRow;
  const [h, m] = (row.clock_in ?? '00:00').split(':').map(Number);
  const start = new Date(now);
  start.setHours(h, m, 0, 0);
  const hours = Math.round(((now.getTime() - start.getTime()) / 3_600_000) * 10) / 10;

  const { data, error } = await supabase
    .from('attendance')
    .update({ clock_out: now.toTimeString().slice(0, 8), hours })
    .eq('id', row.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  const record = toMockAttendance(data as AttendanceRow);
  await logAudit('Clocked out', record.employeeId);
  return record;
}

export interface ReportPayload {
  employeeId: string;
  employeeName: string;
  reason: string;
  date: string;
  note: string;
}

export async function saveWebAuthnCredential(
  employeeId: string,
  credentialId: string,
  deviceName: string,
): Promise<void> {
  if (!supabase) return;
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('employee_id', employeeId)
    .maybeSingle();
  if (error || !user) return;
  const { error: insertError } = await supabase.from('webauthn_credentials').insert({
    user_id: user.id,
    credential_id: credentialId,
    public_key: credentialId,
    counter: 0,
    device_name: deviceName,
  });
  if (insertError) {
    console.warn('Could not persist credential:', insertError.message);
    return;
  }
  await logAudit('Enrolled biometric', `${employeeId} (${deviceName})`);
}

export async function submitReport(payload: ReportPayload): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.from('reports').insert({
    employee_id: payload.employeeId,
    employee_name: payload.employeeName,
    reason: payload.reason,
    date: payload.date || null,
    note: payload.note,
    status: 'Open',
  });
  if (error) throw new Error(error.message);
  await logAudit('Submitted report', `${payload.employeeName} (${payload.reason})`);
}

interface AttendanceHoursRow {
  employee_id: string;
  hours: number | null;
}

export async function generatePayroll(payStart: string, payEnd: string): Promise<PayrollRow[]> {
  if (!supabase) throw new Error('Supabase is not configured');

  const [rosterRes, attRes] = await Promise.all([
    supabase.from('employee_roster').select('employee_id, name, surname'),
    supabase.from('attendance').select('employee_id, hours').gte('date', payStart).lte('date', payEnd),
  ]);
  if (rosterRes.error) throw new Error(rosterRes.error.message);
  if (attRes.error) throw new Error(attRes.error.message);

  const hoursByEmployee = new Map<string, number>();
  for (const row of attRes.data as AttendanceHoursRow[]) {
    if (row.hours === null || row.hours === undefined) continue;
    hoursByEmployee.set(row.employee_id, (hoursByEmployee.get(row.employee_id) ?? 0) + row.hours);
  }

  const rows: PayrollRow[] = (rosterRes.data ?? []).map((emp: { employee_id: string }) => {
    const hours = Math.round((hoursByEmployee.get(emp.employee_id) ?? 0) * 10) / 10;
    const overtime = Math.max(hours - STANDARD_WEEKLY_HOURS, 0);
    const standardHours = hours - overtime;
    const gross = Math.round((standardHours * HOURLY_RATE + overtime * HOURLY_RATE * OVERTIME_RATE_MULTIPLIER) * 100) / 100;
    const deduction = Math.round(gross * DEDUCTION_RATE * 100) / 100;
    const net = Math.round((gross - deduction) * 100) / 100;
    return {
      id: 0,
      employee_id: emp.employee_id,
      pay_start: payStart,
      pay_end: payEnd,
      hours,
      overtime: Math.round(overtime * 10) / 10,
      gross_pay: gross,
      deduction,
      net_pay: net,
      status: 'Pending',
    };
  });

  const { error: deleteError } = await supabase
    .from('payroll')
    .delete()
    .eq('pay_start', payStart)
    .eq('pay_end', payEnd);
  if (deleteError) throw new Error(deleteError.message);

  const { error: insertError } = await supabase.from('payroll').insert(
    rows.map(({ id: _id, ...row }) => row),
  );
  if (insertError) throw new Error(insertError.message);

  await logAudit('Generated payroll', `${payStart} to ${payEnd} (${rows.length} employees)`);
  return rows;
}

export async function markPayrollPaid(payrollId: number): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase
    .from('payroll')
    .update({ status: 'Paid', payment_date: new Date().toISOString().slice(0, 10) })
    .eq('id', payrollId);
  if (error) throw new Error(error.message);
  await logAudit('Approved payroll', `Record #${payrollId}`);
}
