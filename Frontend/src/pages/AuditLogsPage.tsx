import { Icon } from '../components/Icon';

const rows = [
  { employee: 'Bokang Ngwetjana', action: 'Registered employee', target: 'Paballo Diphoko', date: '03 August 2026', time: '09:12', user: 'Bokang Ngwetjana' },
  { employee: 'Bokang Ngwetjana', action: 'Enrolled biometric', target: 'Paballo Diphoko', date: '03 August 2026', time: '09:13', user: 'Bokang Ngwetjana' },
  { employee: 'Mooketsi Mogale', action: 'Updated payroll', target: '00002222', date: '03 August 2026', time: '08:47', user: 'Mooketsi Mogale' },
  { employee: 'Boitumelo Magashula', action: 'Signed in', target: 'Fingerprint', date: '03 August 2026', time: '07:55', user: 'Boitumelo Magashula' },
  { employee: 'Bokang Ngwetjana', action: 'Created report', target: 'Repeated Absence', date: '02 August 2026', time: '15:31', user: 'Bokang Ngwetjana' },
  { employee: 'Junior Mphefo', action: 'Updated profile', target: '00006666', date: '02 August 2026', time: '11:04', user: 'Junior Mphefo' },
];

export function AuditLogsPage() {
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
          </tbody>
        </table>
      </div>
    </>
  );
}
