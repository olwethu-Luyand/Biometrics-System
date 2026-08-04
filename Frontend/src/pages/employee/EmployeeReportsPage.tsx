import { useEffect, useState } from 'react';
import { apiRequest, getStoredUser } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useTableVersion } from '../../lib/supabaseRealtime';
import { submitReport } from '../../lib/supabaseDb';
import type { MockReport } from '../../lib/mock';

const inputClass =
  'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue';

export function EmployeeReportsPage() {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reports, setReports] = useState<MockReport[]>([]);
  const reportsVersion = useTableVersion('reports');

  const loadReports = () => {
    const stored = getStoredUser();
    const employeeId = stored?.employeeId;
    const client = supabase;
    if (employeeId && client) {
      const load = async () => {
        try {
          const { data, error } = await client
            .from('reports')
            .select('id, employee_id, employee_name, reason, date, note, status, created_at')
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false })
            .limit(30);
          if (error || !data || data.length === 0) {
            loadReportsFromMock();
            return;
          }
          setReports(
            (data as {
              id: number;
              reason: string;
              date: string | null;
              note: string | null;
              status: string;
            }[]).map((r) => ({
              id: `rpt-${r.id}`,
              employeeId,
              employeeName: stored.fullName,
              reason: r.reason,
              date: r.date ?? '',
              note: r.note ?? '',
              createdAt: '',
              status: r.status,
            })),
          );
        } catch {
          loadReportsFromMock();
        }
      };
      void load();
      return;
    }
    loadReportsFromMock();
  };

  const loadReportsFromMock = () => {
    apiRequest<{ data: MockReport[] }>('/api/reports')
      .then((res) => setReports(res.data))
      .catch(() => setReports([]));
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsVersion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!reason) {
      setMessage({ type: 'error', text: 'Select a reason for the report.' });
      return;
    }
    try {
      const user = getStoredUser();
      if (user?.employeeId && supabase) {
        try {
          await submitReport({
            employeeId: user.employeeId,
            employeeName: user.fullName,
            reason,
            date,
            note,
          });
        } catch (err) {
          console.warn('Supabase report insert failed, falling back to mock API', err);
          await apiRequest<MockReport>('/api/reports', {
            method: 'POST',
            body: { reason, date, note },
          });
        }
      } else {
        await apiRequest<MockReport>('/api/reports', {
          method: 'POST',
          body: { reason, date, note },
        });
      }
      setMessage({ type: 'success', text: 'Report submitted successfully!' });
      setReason('');
      setDate('');
      setNote('');
      loadReports();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to submit report' });
    }
  };

  return (
    <>
      <h1 className="page-title">Report</h1>
      <p className="welcome-text">Let HR know if you're running late, off sick, or away for another reason.</p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-xl">
        {message && (
          <p className={'text-sm ' + (message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
            {message.text}
          </p>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
            <option value="">Select reason</option>
            <option value="late">Running Late</option>
            <option value="sick">Off Sick</option>
            <option value="other">Other Reason</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Note (optional)</label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add additional details..."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
        >
          Submit
        </button>
      </form>

      {reports.length > 0 && (
        <div className="mt-8">
          <h3 className="text-slate-900 dark:text-slate-50 font-semibold text-base mb-3">My reports</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Note</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date || '—'}</td>
                    <td>{r.reason}</td>
                    <td>{r.note || '—'}</td>
                    <td><span className="badge present">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
