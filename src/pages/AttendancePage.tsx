const rows = [
  { id: '00003333', date: '10 July 2026', checkIn: '08:00', checkOut: '16:00', overtime: '2 Hrs', status: 'Present' as const },
  { id: '00003333', date: '10 July 2026', checkIn: '08:00', checkOut: '16:00', overtime: '0 Hrs', status: 'Absent' as const },
  { id: '00003333', date: '10 July 2026', checkIn: '08:00', checkOut: '16:00', overtime: '5 Hrs', status: 'Present' as const },
  { id: '00003333', date: '10 July 2026', checkIn: '08:00', checkOut: '16:00', overtime: '2 Hrs', status: 'Absent' as const },
  { id: '00003333', date: '10 July 2026', checkIn: '08:00', checkOut: '16:00', overtime: '8 Hrs', status: 'Present' as const },
  { id: '00003333', date: '10 July 2026', checkIn: '08:00', checkOut: '16:00', overtime: '0 Hrs', status: 'Absent' as const },
];

export function AttendancePage() {
  return (
    <>
      <h1 className="page-title">Attendance overview</h1>
      <br />
      <div className="search-box">
        <i className="fa-solid fa-magnifying-glass" style={{ color: '#9ca3af' }} />
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
              <th>Overtime Hrs</th>
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
                <td><span className={`badge ${r.status === 'Present' ? 'present' : 'absent'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
