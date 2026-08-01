const payrollRecords = [
  { id: '00003333', start: '10 July 2026', end: '10 July 2026', hours: 75, overtime: 2, gross: 'R1 750', deduction: 'R50.00', net: 'R1 700', date: '31 July 2026', status: 'Pending' },
  { id: '00003333', start: '10 July 2026', end: '10 July 2026', hours: 75, overtime: 16, gross: 'R1 800', deduction: 'R1 550', net: 'R250.00', date: '1 August 2026', status: 'Paid' },
  { id: '00003333', start: '10 July 2026', end: '10 July 2026', hours: 75, overtime: 16, gross: 'R1 750', deduction: 'R50.00', net: 'R1 700', date: '31 July 2026', status: 'Pending' },
  { id: '00003333', start: '10 July 2026', end: '10 July 2026', hours: 75, overtime: 16, gross: 'R1 800', deduction: 'R1 550', net: 'R250.00', date: '1 August 2026', status: 'Paid' },
];

export function PayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Payroll Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Calculate, review, and approve payroll for the current pay period</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Pay Start</th>
              <th className="p-4">Pay End</th>
              <th className="p-4">Hours</th>
              <th className="p-4">Overtime</th>
              <th className="p-4">Gross Pay</th>
              <th className="p-4">Deduction</th>
              <th className="p-4">Net Pay</th>
              <th className="p-4">Payment Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payrollRecords.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">{item.id}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.start}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.end}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.hours}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.overtime}</td>
                <td className="p-4 text-slate-900 dark:text-slate-100 font-medium">{item.gross}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.deduction}</td>
                <td className="p-4 text-slate-900 dark:text-slate-100 font-medium">{item.net}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{item.date}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
