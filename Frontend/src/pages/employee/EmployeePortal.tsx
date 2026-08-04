import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiRequest, type ApiUser } from '../../lib/api';
import type { MockAttendance } from '../../lib/mock';
import { useLocalAuthn } from '../../hooks/useLocalAuthn';
import { supabase } from '../../lib/supabase';
import { useTableVersion } from '../../lib/supabaseRealtime';
import { clockIn as supabaseClockIn, clockOut as supabaseClockOut } from '../../lib/supabaseDb';
import { EmployeeSidebar } from '../../components/employee/EmployeeSidebar';
import logo from '../../assets/logo.jpeg';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { ClockPage } from './ClockPage';
import { AttendanceHistoryPage } from './AttendanceHistoryPage';
import { EmployeeReportsPage } from './EmployeeReportsPage';
import { EmployeeProfilePage } from './EmployeeProfilePage';

type Page = 'dashboard' | 'clock-in' | 'clock-out' | 'history' | 'reports' | 'profile';

interface EmployeePortalProps {
  user: ApiUser;
  onLogout: () => void;
}

export function EmployeePortal({ user, onLogout }: EmployeePortalProps) {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [clockIn, setClockIn] = useState<Date | null>(null);
  const [clockOut, setClockOut] = useState<Date | null>(null);
  const [history, setHistory] = useState<MockAttendance[]>([]);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const attendanceVersion = useTableVersion('attendance');
  const { isSupported, isBusy, error, authenticate } = useLocalAuthn();

  useEffect(() => {
    const client = supabase;
    if (user.employeeId && client) {
      const load = async () => {
        try {
          const { data, error } = await client
            .from('attendance')
            .select('id, employee_id, date, clock_in, clock_out, hours, status')
            .eq('employee_id', user.employeeId)
            .order('date', { ascending: false })
            .limit(30);
          if (error || !data || data.length === 0) {
            loadHistoryFromMock();
            return;
          }
          setHistory(
            (data as {
              id: number;
              employee_id: string;
              date: string;
              clock_in: string | null;
              clock_out: string | null;
              hours: number | null;
              status: string;
            }[]).map((r) => ({
              id: `a${r.id}`,
              employeeId: r.employee_id,
              date: new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
              clockIn: r.clock_in ? r.clock_in.slice(0, 5) : '',
              clockOut: r.clock_out ? r.clock_out.slice(0, 5) : null,
              hours: r.hours !== null && r.hours !== undefined ? `${r.hours} Hrs` : 'Pending',
              status: r.status as MockAttendance['status'],
            })),
          );
        } catch {
          loadHistoryFromMock();
        }
      };
      void load();
      return;
    }
    loadHistoryFromMock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.employeeId, attendanceVersion]);

  const loadHistoryFromMock = () => {
    apiRequest<{ data: MockAttendance[] }>('/api/attendance')
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]));
  };

  const firstName = user.fullName.split(' ')[0] ?? user.fullName;
  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleClockIn = async () => {
    const ok = await authenticate();
    if (!ok) return;
    try {
      let res: { message: string; record: MockAttendance };
      if (user.employeeId && supabase) {
        try {
          res = { message: 'Clocked in successfully', record: await supabaseClockIn(user.employeeId) };
        } catch (err) {
          console.warn('Supabase clock-in failed, falling back to mock API', err);
          res = await apiRequest<{ message: string; record: MockAttendance }>('/api/attendance/clock-in', {
            method: 'POST',
            body: {},
          });
        }
      } else {
        res = await apiRequest<{ message: string; record: MockAttendance }>('/api/attendance/clock-in', {
          method: 'POST',
          body: {},
        });
      }
      setClockIn(new Date());
      setClockOut(null);
      setHistory((prev) => [res.record, ...prev]);
      setNotice({ type: 'success', text: res.message });
      setActivePage('dashboard');
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Clock in failed' });
    }
  };

  const handleClockOut = async () => {
    const ok = await authenticate();
    if (!ok) return;
    try {
      let res: { message: string; record: MockAttendance };
      if (user.employeeId && supabase) {
        try {
          res = { message: 'Clocked out successfully', record: await supabaseClockOut(user.employeeId) };
        } catch (err) {
          console.warn('Supabase clock-out failed, falling back to mock API', err);
          res = await apiRequest<{ message: string; record: MockAttendance }>('/api/attendance/clock-out', {
            method: 'POST',
            body: {},
          });
        }
      } else {
        res = await apiRequest<{ message: string; record: MockAttendance }>('/api/attendance/clock-out', {
          method: 'POST',
          body: {},
        });
      }
      setClockOut(new Date());
      setHistory((prev) => prev.map((r) => (r.id === res.record.id ? res.record : r)));
      setNotice({ type: 'success', text: res.message });
      setActivePage('dashboard');
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Clock out failed' });
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <EmployeeDashboardPage name={firstName} clockIn={clockIn} clockOut={clockOut} history={history} />;
      case 'clock-in':
        return <ClockPage mode="in" isBusy={isBusy} isSupported={isSupported} error={error} onClock={() => void handleClockIn()} />;
      case 'clock-out':
        return <ClockPage mode="out" isBusy={isBusy} isSupported={isSupported} error={error} onClock={() => void handleClockOut()} />;
      case 'history':
        return <AttendanceHistoryPage history={history} />;
      case 'reports':
        return <EmployeeReportsPage />;
      case 'profile':
        return <EmployeeProfilePage />;
      default:
        return <EmployeeDashboardPage name={firstName} clockIn={clockIn} clockOut={clockOut} history={history} />;
    }
  };

  return (
    <div className="app-layout">
      <EmployeeSidebar active={activePage} onNavigate={(id) => setActivePage(id as Page)} onLogout={onLogout} />
      <div className="main-area">
        <header className="topnav">
          <div className="topnav-left">
            <img src={logo} alt="PrimeOak" className="topnav-logo" />
          </div>
          <div className="topnav-right">
            <span className="topnav-user">{user.fullName}</span>
            <div className="topnav-avatar">{initials}</div>
          </div>
        </header>
        <main className="main-content">
          {notice && (
            <div className={'mb-4 text-sm px-4 py-3 rounded-xl border ' + (notice.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400')}>
              {notice.text}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
