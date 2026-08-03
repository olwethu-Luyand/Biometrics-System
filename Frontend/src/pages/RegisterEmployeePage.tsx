import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import {
  CheckCircle,
  Fingerprint,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { useWebAuthn } from '../hooks/useWebAuthn';
import {
  getEmployees,
  registerEmployee,
} from '../services/employeeService';
import type {
  Employee,
  RegisterEmployeeRequest,
} from '../types/employee';

type ViewMode = 'list' | 'add';

type BiometricStatus =
  | 'idle'
  | 'scanning'
  | 'registered'
  | 'error';

interface EmployeeForm {
  name: string;
  surname: string;
  emailAddress: string;
  role: string;
  password: string;
  confirmPassword: string;
  scannerDeviceId: string;
}

const initialForm: EmployeeForm = {
  name: '',
  surname: '',
  emailAddress: '',
  role: 'Employee',
  password: '',
  confirmPassword: '',
  scannerDeviceId: '',
};

export function RegisterEmployeePage() {
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] =
    useState<EmployeeForm>(initialForm);

  const [bioStatus, setBioStatus] =
    useState<BiometricStatus>('idle');

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, isSupported } = useWebAuthn();

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setError('');

    try {
      const result = await getEmployees();
      setEmployees(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load employees.',
      );
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName =
        `${employee.name} ${employee.surname}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        employee.emailAddress
          .toLowerCase()
          .includes(searchValue) ||
        employee.role
          .toLowerCase()
          .includes(searchValue) ||
        employee.employeeId
          .toString()
          .includes(searchValue)
      );
    });
  }, [employees, search]);

  function updateForm(
    field: keyof EmployeeForm,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function openAddEmployee() {
    setForm(initialForm);
    setBioStatus('idle');
    setError('');
    setSuccess('');
    setView('add');
  }

  function returnToList() {
    setForm(initialForm);
    setBioStatus('idle');
    setError('');
    setView('list');
  }

  async function handleBiometricRegistration() {
    if (
      !isSupported ||
      bioStatus === 'scanning' ||
      bioStatus === 'registered'
    ) {
      return;
    }

    setBioStatus('scanning');

    try {
      await register();
      setBioStatus('registered');
    } catch {
      setBioStatus('error');

      window.setTimeout(() => {
        setBioStatus('idle');
      }, 3000);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError(
        'Password and confirmation password do not match.',
      );
      return;
    }

    if (form.password.length < 8) {
      setError(
        'Password must contain at least 8 characters.',
      );
      return;
    }

    const request: RegisterEmployeeRequest = {
      name: form.name.trim(),
      surname: form.surname.trim(),
      role: form.role,
      password: form.password,
      emailAddress: form.emailAddress
        .trim()
        .toLowerCase(),
      scannerDeviceId:
        form.scannerDeviceId.trim() || null,
      fingerprintTemplate: null,
    };

    setSubmitting(true);

    try {
      const response = await registerEmployee(request);

      setSuccess(
        response.message ||
          'Employee registered successfully.',
      );

      setForm(initialForm);
      setBioStatus('idle');

      await loadEmployees();

      window.setTimeout(() => {
        setView('list');
      }, 800);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Employee registration failed.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (view === 'add') {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Add details of an employee
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register a new staff member into the system
            </p>
          </div>

          <button
            type="button"
            onClick={returnToList}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ← Back to List
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="employeeName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Name
              </label>

              <input
                id="employeeName"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateForm(
                    'name',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employeeSurname"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Surname
              </label>

              <input
                id="employeeSurname"
                type="text"
                value={form.surname}
                onChange={(event) =>
                  updateForm(
                    'surname',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employeeEmail"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>

              <input
                id="employeeEmail"
                type="email"
                value={form.emailAddress}
                onChange={(event) =>
                  updateForm(
                    'emailAddress',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employeeRole"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Role
              </label>

              <select
                id="employeeRole"
                value={form.role}
                onChange={(event) =>
                  updateForm(
                    'role',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              >
                <option value="Employee">
                  Employee
                </option>

                <option value="HR">
                  HR
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="scannerDeviceId"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Scanner device ID
              </label>

              <input
                id="scannerDeviceId"
                type="text"
                value={form.scannerDeviceId}
                onChange={(event) =>
                  updateForm(
                    'scannerDeviceId',
                    event.target.value,
                  )
                }
                placeholder="Example: SCANNER-001"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employeePassword"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Temporary password
              </label>

              <input
                id="employeePassword"
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateForm(
                    'password',
                    event.target.value,
                  )
                }
                minLength={8}
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateForm(
                    'confirmPassword',
                    event.target.value,
                  )
                }
                minLength={8}
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <button
              type="button"
              disabled={!isSupported}
              onClick={() =>
                void handleBiometricRegistration()
              }
              className={
                'flex flex-col items-center justify-center p-4 border border-dashed rounded-xl transition-colors ' +
                (isSupported
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed') +
                ' ' +
                (bioStatus === 'registered'
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                  : bioStatus === 'error'
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-brand-blue')
              }
            >
              {bioStatus === 'registered' ? (
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              ) : bioStatus === 'scanning' ? (
                <Fingerprint className="w-16 h-16 text-brand-blue animate-pulse" />
              ) : bioStatus === 'error' ? (
                <XCircle className="w-16 h-16 text-red-500" />
              ) : (
                <Fingerprint
                  className={
                    'w-16 h-16 transition-colors ' +
                    (isSupported
                      ? 'text-slate-400 dark:text-slate-500 hover:text-brand-blue'
                      : 'text-slate-300 dark:text-slate-600')
                  }
                />
              )}

              <p
                className={
                  'text-xs mt-2 font-medium ' +
                  (bioStatus === 'registered'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : bioStatus === 'error'
                      ? 'text-red-500'
                      : 'text-slate-400 dark:text-slate-500')
                }
              >
                {bioStatus === 'registered'
                  ? 'Browser biometric confirmed'
                  : bioStatus === 'scanning'
                    ? 'Scanning...'
                    : bioStatus === 'error'
                      ? 'Scan failed'
                      : isSupported
                        ? 'Tap to test biometric support'
                        : 'Biometric not available'}
              </p>

              <p className="mt-1 text-center text-[11px] text-slate-400">
                Physical fingerprint enrollment will use
                the scanner SDK.
              </p>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-brand-blue hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              {submitting
                ? 'Registering...'
                : 'Register employee'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Registered employees
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            A full list of registered employees
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
            />
          </div>

          <button
            type="button"
            onClick={openAddEmployee}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add employee</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="p-4">
                Employee ID
              </th>

              <th className="p-4">
                Name
              </th>

              <th className="p-4">
                Surname
              </th>

              <th className="p-4">
                Email address
              </th>

              <th className="p-4">
                Role
              </th>

              <th className="p-4">
                Fingerprint
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loadingEmployees ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500 dark:text-slate-400"
                >
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.employeeId}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {employee.employeeId}
                  </td>

                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                    {employee.name}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {employee.surname}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {employee.emailAddress}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {employee.role}
                  </td>

                  <td className="p-4">
                    {employee.fingerprintEnrolled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        Enrolled
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">
                        Not enrolled
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}