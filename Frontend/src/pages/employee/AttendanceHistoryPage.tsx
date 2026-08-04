import type { MockAttendance } from '../../lib/mock';

interface AttendanceHistoryPageProps {
  history: MockAttendance[];
}

export function AttendanceHistoryPage({ history }: AttendanceHistoryPageProps) {
  return (
    <>
      <h1 className="page-title">My history</h1>
      <p className="welcome-text">Your attendance record</p>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock in</th>
              <th>Clock out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.clockIn}</td>
                <td>{r.clockOut ?? '—'}</td>
                <td>{r.hours}</td>
                <td>
                  <span className={`badge ${r.status === 'Present' ? 'present' : 'absent'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="text-slate-400 text-sm">No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
