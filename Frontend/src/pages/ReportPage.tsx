import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function ReportPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!employeeId.trim()) {
      setMessage({ type: 'error', text: 'Enter an employee ID.' });
      return;
    }
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Enter a report title.' });
      return;
    }
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' });
      return;
    }

    const { data: roster, error: rosterError } = await supabase
      .from('employee_roster')
      .select('name, surname')
      .eq('employee_id', employeeId.trim())
      .maybeSingle();
    if (rosterError) {
      setMessage({ type: 'error', text: rosterError.message });
      return;
    }
    if (!roster) {
      setMessage({ type: 'error', text: 'No employee found with that ID.' });
      return;
    }

    const lower = title.trim().toLowerCase();
    const reason = ['late', 'sick', 'other'].includes(lower) ? lower : 'other';
    const { error } = await supabase.from('reports').insert({
      employee_id: employeeId.trim(),
      employee_name: `${roster.name} ${roster.surname}`,
      reason,
      date: new Date().toISOString().slice(0, 10),
      note: `${title.trim()}${description.trim() ? `\n${description.trim()}` : ''}`,
      status: 'Open',
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: 'Report saved to the database.' });
    setEmployeeId('');
    setTitle('');
    setDescription('');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Create a report</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Log a report against an employee</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. 00001111"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Repeated Absence"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details for this report..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
        >
          Save report
        </button>
      </form>
    </div>
  );
}
