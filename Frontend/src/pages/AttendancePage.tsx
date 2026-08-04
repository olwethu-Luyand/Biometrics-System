import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useTableVersion } from '../lib/supabaseRealtime';

interface AttendanceRow {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  overtime: string;
  status: 'Present' | 'Absent' | 'Late';
}

interface AttendanceDbRow {
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours: number | null;
  status: string;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mapRow(r: AttendanceDbRow): AttendanceRow {
  return {
    id: r.employee_id,
    date: formatDate(r.date),
    checkIn: r.clock_in ? r.clock_in.slice(0, 5) : '-',
    checkOut: r.clock_out ? r.clock_out.slice(0, 5) : '-',
    overtime: r.hours !== null && r.hours !== undefined ? `${r.hours} Hrs` : '-',
    status: r.status as AttendanceRow['status'],
  };
}

export function AttendancePage() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const version = useTableVersion('attendance');

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    supabase
      .from('attendance')
      .select('employee_id, date, clock_in, clock_out, hours, status')
      .order('date', { ascending: false })
      .order('employee_id', { ascending: true })
      .limit(100)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setRows(data.map(mapRow));
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return (
    <>
      <h1 className="page-title">Attendance overview</h1>
      <br />
      <div className="search-box">
        <Icon name="search" className="w-4 h-4 search-icon" />
        <input type="text" placeholder="Search employee" />
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.id}</td>
                <td>{r.date}</td>
                <td>{r.checkIn}</td>
                <td>{r.checkOut}</td>
                <td>{r.overtime}</td>
                <td>{r.status}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-slate-400 text-sm">No attendance records in the database yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
