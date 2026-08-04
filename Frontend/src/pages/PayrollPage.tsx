import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { generatePayroll, markPayrollPaid } from '../lib/supabaseDb';
import { useTableVersion } from '../lib/supabaseRealtime';

interface PayrollRecord {
  id: string;
  start: string;
  end: string;
  hours: string;
  overtime: string;
  gross: string;
  deduction: string;
  net: string;
  date: string;
  status: string;
}

interface PayrollDbRow {
  id: number;
  employee_id: string;
  pay_start: string;
  pay_end: string;
  hours: number | null;
  overtime: number | null;
  gross_pay: number | null;
  deduction: number | null;
  net_pay: number | null;
  payment_date: string | null;
  status: string;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatRand(value: number | null): string {
  return value === null || value === undefined
    ? '-'
    : `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mapRow(r: PayrollDbRow): PayrollRecord {
  return {
    id: String(r.id),
    start: formatDate(r.pay_start),
    end: formatDate(r.pay_end),
    hours: r.hours !== null && r.hours !== undefined ? String(r.hours) : '-',
    overtime: r.overtime !== null && r.overtime !== undefined ? String(r.overtime) : '-',
    gross: formatRand(r.gross_pay),
    deduction: formatRand(r.deduction),
    net: formatRand(r.net_pay),
    date: r.payment_date ? formatDate(r.payment_date) : '-',
    status: r.status,
  };
}

const inputClass =
  'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600';

export function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [payStart, setPayStart] = useState('');
  const [payEnd, setPayEnd] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const version = useTableVersion('payroll');

  const loadRecords = () => {
    if (!supabase) return;
    supabase
      .from('payroll')
      .select('id, employee_id, pay_start, pay_end, hours, overtime, gross_pay, deduction, net_pay, payment_date, status')
      .order('pay_start', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error || !data) return;
        setRecords(data.map(mapRow));
      });
  };

  useEffect(() => {
    loadRecords();
  }, [version]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!payStart || !payEnd) {
      setMessage({ type: 'error', text: 'Select a pay period (start and end dates).' });
      return;
    }
    if (payEnd < payStart) {
      setMessage({ type: 'error', text: 'Pay end date must be after the start date.' });
      return;
    }
    setBusy(true);
    try {
      const rows = await generatePayroll(payStart, payEnd);
      setMessage({
        type: 'success',
        text: `Payroll generated for ${rows.length} employees (${rows.reduce((sum, r) => sum + r.net_pay, 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })} total net).`,
      });
      loadRecords();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate payroll' });
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setMessage(null);
    try {
      await markPayrollPaid(Number(id));
      setMessage({ type: 'success', text: 'Payroll record marked as paid.' });
      loadRecords();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update payroll' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Payroll Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generate payroll from attendance, review, and approve payments
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pay period start</label>
          <input type="date" value={payStart} onChange={(e) => setPayStart(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pay period end</label>
          <input type="date" value={payEnd} onChange={(e) => setPayEnd(e.target.value)} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="sm:col-span-2 lg:col-span-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-colors"
        >
          {busy ? 'Generating…' : 'Generate payroll from attendance'}
        </button>
        {message && (
          <p className={`sm:col-span-2 lg:col-span-4 text-sm ${message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </form>

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
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((item, idx) => (
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
                <td className="p-4">
                  {item.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => void handleMarkPaid(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                    >
                      Mark paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={11} className="p-4 text-slate-400 text-sm">
                  No payroll records yet — pick a pay period and generate one from attendance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Calculation: standard hours at R25/hr, overtime at 1.5x beyond 40 hrs, 5% deduction. Regenerating a period replaces its records.
      </p>
    </div>
  );
}
