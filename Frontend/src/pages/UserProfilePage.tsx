import { useState } from 'react';
import { User, Mail, Shield, IdCard, Edit3, Save } from 'lucide-react';
import userLogo from '../assets/user-Logo.jpg';

export function UserProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: 'Olwethu Xaba',
    role: 'HR Manager',
    id: '00008888',
    email: 'oXaba@gmail.com',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditing(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Profile settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal details</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
            <img src={userLogo} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{form.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{form.role}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { label: 'Full Name', value: form.name, icon: User, name: 'name' },
            { label: 'Employee ID', value: form.id, icon: IdCard, name: 'id' },
            { label: 'Role', value: form.role, icon: Shield, name: 'role' },
            { label: 'Email Address', value: form.email, icon: Mail, name: 'email' },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.name} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">{field.label}</p>
                  {editing ? (
                    <input
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="w-full mt-0.5 bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-brand-blue pb-0.5"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{field.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={editing ? handleSave : () => setEditing(true)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
        >
          {editing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{editing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>
    </div>
  );
}
