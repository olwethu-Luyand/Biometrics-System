import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fingerprint, Plus, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useWebAuthn } from '../hooks/useWebAuthn';
import { apiRequest } from '../lib/api';
import { insertEmployee } from '../lib/supabaseDb';
import { supabase } from '../lib/supabase';
import { useTableVersion } from '../lib/supabaseRealtime';

const schema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    surname: z.string().trim().min(2, 'Surname must be at least 2 characters'),
    email: z.string().trim().email('Enter a valid email address'),
    role: z.string().trim().min(2, 'Role must be at least 2 characters'),
    employeeId: z.string().trim().regex(/^\d{8}$/, 'Employee ID must be 8 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormData = z.infer<typeof schema>;

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

type BioStatus = 'idle' | 'scanning' | 'registered' | 'error';

const inputClass =
  'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

export function RegisterEmployeePage() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [listError, setListError] = useState('');
  const [bioStatus, setBioStatus] = useState<BioStatus>('idle');
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const usersVersion = useTableVersion('users');
  const { register: registerBio, isSupported } = useWebAuthn();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const loadEmployees = () => {
    const client = supabase;
    if (client) {
      const load = async () => {
        try {
          const { data, error } = await client
            .from('employee_roster')
            .select('employee_id, name, surname, email, role')
            .order('employee_id', { ascending: true });
          if (error || !data) {
            loadEmployeesFromMock();
            return;
          }
          setEmployees(
            (data as { employee_id: string; name: string; surname: string; email: string; role: string }[]).map((row) => ({
              id: 0,
              employeeId: row.employee_id,
              name: row.name,
              surname: row.surname,
              email: row.email,
              role: row.role,
            })),
          );
          setListError('');
        } catch {
          loadEmployeesFromMock();
        }
      };
      void load();
      return;
    }
    loadEmployeesFromMock();
  };

  const loadEmployeesFromMock = () => {
    apiRequest<{ data: Employee[] }>('/api/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => setListError(err instanceof Error ? err.message : 'Failed to load employees'));
  };

  useEffect(() => {
    if (view === 'list') loadEmployees();
  }, [view, usersVersion]);

  useEffect(() => {
    if (view === 'add') {
      reset();
      setCreatedEmployee(null);
      setNotice(null);
      setBioStatus('idle');
    }
  }, [view, reset]);

  const enrollBiometric = async (employeeId: string) => {
    setBioStatus('scanning');
    setNotice(null);
    try {
      await registerBio(employeeId);
      setBioStatus('registered');
      setNotice({ type: 'success', text: 'Fingerprint enrolled successfully' });
    } catch (err) {
      setBioStatus('error');
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Fingerprint scan failed' });
    }
  };

  useEffect(() => {
    if (createdEmployee && isSupported && bioStatus === 'idle') {
      enrollBiometric(createdEmployee.employeeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdEmployee]);

  const onFormSubmit = async (data: FormData) => {
    setNotice(null);
    try {
      const created = await createEmployee(data);
      setCreatedEmployee(created);
      setNotice({ type: 'success', text: `Employee ${created.name} ${created.surname} (${created.employeeId}) created.` });
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Failed to register employee' });
    }
  };

  const createEmployee = async (data: FormData): Promise<Employee> => {
    if (supabase) {
      try {
        await insertEmployee({
          employeeId: data.employeeId,
          name: data.fullName,
          surname: data.surname,
          email: data.email,
          role: data.role,
          password: data.password,
        });
        return { id: 0, employeeId: data.employeeId, name: data.fullName, surname: data.surname, email: data.email, role: data.role };
      } catch (err) {
        console.warn('Supabase insert failed, falling back to mock API', err);
      }
    }
    return apiRequest<Employee>('/api/employees', {
      method: 'POST',
      body: {
        name: data.fullName,
        surname: data.surname,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId,
        password: data.password,
      },
    });
  };

  const onBioClick = async () => {
    if (bioStatus === 'registered' || !isSupported || isSubmitting) return;
    const employeeId = createdEmployee?.employeeId ?? getValues('employeeId');
    if (!employeeId) {
      setNotice({ type: 'error', text: 'Enter a valid Employee ID, then register the employee first.' });
      return;
    }
    if (!createdEmployee) {
      setNotice({ type: 'error', text: 'Register the employee first, then scan the fingerprint.' });
      return;
    }
    await enrollBiometric(employeeId);
  };

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((emp) =>
      [emp.name, emp.surname, emp.employeeId].some((field) => field.toLowerCase().includes(q)),
    );
  }, [employees, search]);

  if (view === 'add') {
    return (
      <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Add details of an employee</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Register new staff member into the system</p>
          </div>
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ← Back to List
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {notice && (
            <div className={'text-sm px-4 py-3 rounded-xl border ' + (notice.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400')}>
              {notice.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <input type="text" {...register('fullName')} className={inputClass} />
              <FieldError message={errors.fullName?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Surname</label>
              <input type="text" {...register('surname')} className={inputClass} />
              <FieldError message={errors.surname?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <input type="email" {...register('email')} className={inputClass} />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select {...register('role')} className={inputClass}>
                <option value="">Select a role</option>
                <option value="Employee">Employee</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <FieldError message={errors.role?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID</label>
              <input type="text" placeholder="00000000" {...register('employeeId')} className={inputClass} />
              <FieldError message={errors.employeeId?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input type="password" {...register('password')} className={inputClass} />
              <FieldError message={errors.password?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
              <input type="password" {...register('confirmPassword')} className={inputClass} />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <div
              className={'flex flex-col items-center justify-center p-4 border border-dashed rounded-xl cursor-pointer transition-colors ' + (bioStatus === 'registered' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : bioStatus === 'error' ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : bioStatus === 'scanning' ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-300 dark:border-slate-700 hover:border-brand-blue')}
              onClick={onBioClick}
            >
              {bioStatus === 'registered' ? (
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              ) : bioStatus === 'scanning' ? (
                <Loader2 className="w-16 h-16 text-brand-blue animate-spin" />
              ) : bioStatus === 'error' ? (
                <XCircle className="w-16 h-16 text-red-500" />
              ) : (
                <Fingerprint className={'w-16 h-16 transition-colors ' + (isSupported ? 'text-slate-400 dark:text-slate-500 hover:text-brand-blue' : 'text-slate-300 dark:text-slate-600')} />
              )}
              <p className={'text-xs mt-2 font-medium ' + (bioStatus === 'registered' ? 'text-emerald-600 dark:text-emerald-400' : bioStatus === 'error' ? 'text-red-500' : bioStatus === 'scanning' ? 'text-brand-blue' : 'text-slate-400 dark:text-slate-500')}>
                {bioStatus === 'registered'
                  ? 'Biometric Registered'
                  : bioStatus === 'scanning'
                  ? 'Scanning...'
                  : bioStatus === 'error'
                  ? 'Scan failed — tap to retry'
                  : isSupported
                  ? 'Tap to scan fingerprint'
                  : 'Biometric not available'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || bioStatus === 'scanning'}
              className="px-6 py-3 bg-brand-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Register employee'}
            </button>
          </div>
        </div>
      </form>
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

      {listError && <p className="text-sm text-red-500">{listError}</p>}

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
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">{emp.employeeId}</td>
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{emp.name}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{emp.surname}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{emp.email}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{emp.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">No employees found.</p>
        )}
      </div>
    </div>
  );
}
