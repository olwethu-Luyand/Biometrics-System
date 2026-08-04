import { useEffect, useState } from 'react';
import { apiRequest, getStoredUser } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  avatar: string | null;
}

const inputClass =
  'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue';

export function EmployeeProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    const employeeId = stored?.employeeId;
    const client = supabase;
    if (employeeId && client) {
      const load = async () => {
        try {
          const { data, error } = await client
            .from('employee_roster')
            .select('name, surname, email, role')
            .eq('employee_id', employeeId)
            .maybeSingle();
          if (error || !data) {
            loadFromMock();
            return;
          }
          const full = `${data.name} ${data.surname}`;
          setProfile({ id: 0, fullName: full, email: data.email, role: data.role, avatar: null });
          setFullName(full);
          setEmail(data.email);
        } catch {
          loadFromMock();
        }
      };
      void load();
      return;
    }
    loadFromMock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFromMock = () => {
    apiRequest<Profile>('/api/profile')
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName);
        setEmail(data.email);
      })
      .catch(() => setProfile(null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const stored = getStoredUser();
    try {
      if (stored?.employeeId && supabase) {
        const parts = fullName.trim().split(/\s+/);
        const name = parts[0] ?? '';
        const surname = parts.slice(1).join(' ') || name;
        const { error } = await supabase
          .from('users')
          .update({ name, surname, email })
          .eq('employee_id', stored.employeeId);
        if (error) throw new Error(error.message);
        setProfile((prev) => (prev ? { ...prev, fullName, email } : prev));
      } else {
        await apiRequest('/api/profile', { method: 'PUT', body: { fullName, email } });
        setProfile((prev) => (prev ? { ...prev, fullName, email } : prev));
      }
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' });
    }
  };

  if (!profile) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl">
        <p className="text-slate-400 dark:text-slate-500">Loading profile…</p>
      </div>
    );
  }

  const initials = profile.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <h1 className="page-title">Profile settings</h1>
      <p className="welcome-text">Update your personal details</p>

      <div className="flex flex-col sm:flex-row gap-6 items-stretch">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center w-full sm:w-64 flex flex-col items-center justify-center gap-3">
          <div className="w-24 h-24 rounded-full bg-brand-blue text-white font-bold text-3xl flex items-center justify-center">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">{profile.fullName}</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{profile.role}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex-1 max-w-xl">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-5">
              {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message.text}</p>}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors">
                  Save
                </button>
                <button type="button" onClick={() => { setEditing(false); setFullName(profile.fullName); setEmail(profile.email); }} className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {message && <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">{message.text}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profile.fullName}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Role</label>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profile.role}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Email Address</label>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profile.email}</span>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors">
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
