import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useTableVersion } from '../lib/supabaseRealtime';

interface AuditRow {
  date: string;
  time: string;
  user: string;
  action: string;
  target: string;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const version = useTableVersion('audit_logs');

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    supabase
      .from('audit_logs')
      .select('actor, action, target, log_date, log_time')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setRows(
          data.map((r) => ({
            date: formatDate(r.log_date),
            time: r.log_time.slice(0, 5),
            user: r.actor,
            action: r.action,
            target: r.target ?? '',
          })),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return (
    <>
      <h1 className="page-title">Audit logs</h1>
      <br />
      <div className="search-box">
        <Icon name="search" className="w-4 h-4 search-icon" />
        <input type="text" placeholder="Search audit log" />
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.time}</td>
                <td>{r.user}</td>
                <td>{r.action}</td>
                <td>{r.target}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-slate-400 text-sm">No audit log entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
