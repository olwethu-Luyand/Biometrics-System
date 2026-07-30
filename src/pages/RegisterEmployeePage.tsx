import { useState } from 'react';
import { Fingerprint, Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { useWebAuthn } from '../hooks/useWebAuthn';

export function RegisterEmployeePage() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [bioStatus, setBioStatus] = useState<'idle' | 'scanning' | 'registered' | 'error'>('idle');
  const { register, isSupported } = useWebAuthn();

  const registeredEmployees = [
    { id: '00003333', name: 'Boitumelo', surname: 'Magashula', email: 'bfMag@gmail.com', role: 'Employee' },
    { id: '00003333', name: 'Bokang', surname: 'Ngwetjana', email: 'bNwge@gmail.com', role: 'HR Manager' },
    { id: '00003333', name: 'Paballo', surname: 'Diphoko', email: 'pDiph@gmail.com', role: 'Employee' },
  ];

  if (view === 'add') {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Add details of an employee</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Register new staff member into the system</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ← Back to List
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Surname</label>
              <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <input type="email" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID</label>
              <input type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input type="password" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
              <input type="password" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue" />
            </div>

            <div
              className={'flex flex-col items-center justify-center p-4 border border-dashed rounded-xl cursor-pointer transition-colors ' + (bioStatus === 'registered' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : bioStatus === 'error' ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-300 dark:border-slate-700 hover:border-brand-blue')}
              onClick={async () => {
                if (bioStatus === 'registered' || !isSupported) return;
                setBioStatus('scanning');
                try {
                  await register();
                  setBioStatus('registered');
                } catch {
                  setBioStatus('error');
                  setTimeout(() => setBioStatus('idle'), 3000);
                }
              }}
            >
              {bioStatus === 'registered' ? (
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              ) : bioStatus === 'scanning' ? (
                <Fingerprint className="w-16 h-16 text-brand-blue animate-pulse" />
              ) : bioStatus === 'error' ? (
                <XCircle className="w-16 h-16 text-red-500" />
              ) : (
                <Fingerprint className={'w-16 h-16 transition-colors ' + (isSupported ? 'text-slate-400 dark:text-slate-500 hover:text-brand-blue' : 'text-slate-300 dark:text-slate-600')} />
              )}
              <p className={'text-xs mt-2 font-medium ' + (bioStatus === 'registered' ? 'text-emerald-600 dark:text-emerald-400' : bioStatus === 'error' ? 'text-red-500' : 'text-slate-400 dark:text-slate-500')}>
                {bioStatus === 'registered'
                  ? 'Biometric Registered'
                  : bioStatus === 'scanning'
                  ? 'Scanning...'
                  : bioStatus === 'error'
                  ? 'Scan Failed'
                  : isSupported
                  ? 'Tap to scan fingerprint'
                  : 'Biometric not available'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              Register employee
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Registered employees</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">A full list of enrolled employees</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
            />
          </div>

          <button
            onClick={() => setView('add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add employee</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Surname</th>
              <th className="p-4">Email address</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {registeredEmployees.map((emp, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">{emp.id}</td>
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{emp.name}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{emp.surname}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{emp.email}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{emp.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
