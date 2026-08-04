import { motion } from 'framer-motion';
import { Clock, Timer, CalendarDays } from 'lucide-react';
import type { MockAttendance } from '../../lib/mock';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

interface EmployeeDashboardPageProps {
  name: string;
  clockIn: Date | null;
  clockOut: Date | null;
  history: MockAttendance[];
}

export function EmployeeDashboardPage({ name, clockIn, clockOut, history }: EmployeeDashboardPageProps) {
  const hoursWorked =
    clockIn && clockOut
      ? ((clockOut.getTime() - clockIn.getTime()) / 3_600_000).toFixed(1)
      : '0';

  const daysWorked = new Set(history.map((r) => r.date)).size;

  const stats = [
    { label: 'Clocked in', value: clockIn ? formatTime(clockIn) : '--:--', icon: Clock, cls: 'blue' },
    { label: 'Hours worked', value: `${hoursWorked} Hrs`, icon: Timer, cls: 'green' },
    { label: 'Days worked', value: String(daysWorked), icon: CalendarDays, cls: 'red' },
  ];

  return (
    <>
      <h1 className="page-title">Employee Dashboard</h1>
      <p className="welcome-text">Welcome back, {name}</p>

      <section className="stats-row">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={`stat-card ${s.cls}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
          >
            <div className="icon-wrapper"><s.icon className="w-5 h-5" /></div>
            <div className="stat-info">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          </motion.div>
        ))}
      </section>

      <h3 className="text-slate-900 dark:text-slate-50 font-semibold text-base mb-3">Recent activity</h3>
      <div className="table-container" style={{ maxWidth: 560 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 3).map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.clockIn} - {r.clockOut ?? '—'}</td>
                <td><span className={`badge ${r.status === 'Present' ? 'present' : 'absent'}`}>{r.status}</span></td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={3} className="text-slate-400 text-sm">No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
