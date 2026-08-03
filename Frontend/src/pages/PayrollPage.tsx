import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  CheckCircle,
  DollarSign,
  Plus,
  Search,
} from 'lucide-react';

import { getEmployees } from '../services/employeeService';

import {
  approvePayroll,
  calculatePayroll,
  getPayrolls,
  markPayrollPaid,
} from '../services/payrollService';

import type { Employee } from '../types/employee';

import type {
  CalculatePayrollRequest,
  PayrollRecord,
} from '../types/payroll';

interface PayrollForm {
  employeeId: string;
  payStart: string;
  payEnd: string;
  hourlyRate: string;
  overtimeRate: string;
}

const initialForm: PayrollForm = {
  employeeId: '',
  payStart: '',
  payEnd: '',
  hourlyRate: '',
  overtimeRate: '',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function PayrollPage() {
  const [view, setView] =
    useState<'list' | 'calculate'>('list');

  const [payrolls, setPayrolls] =
    useState<PayrollRecord[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [form, setForm] =
    useState<PayrollForm>(initialForm);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPayrollData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [payrollRecords, employeeRecords] =
        await Promise.all([
          getPayrolls(),
          getEmployees(),
        ]);

      setPayrolls(payrollRecords);
      setEmployees(employeeRecords);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load payroll data.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayrollData();
  }, [loadPayrollData]);

  const filteredPayrolls = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return payrolls;
    }

    return payrolls.filter((payroll) => {
      return (
        payroll.employeeName
          .toLowerCase()
          .includes(value) ||
        payroll.employeeId
          .toString()
          .includes(value) ||
        payroll.status
          .toLowerCase()
          .includes(value) ||
        payroll.payStart.includes(value) ||
        payroll.payEnd.includes(value)
      );
    });
  }, [payrolls, search]);

  function updateForm(
    field: keyof PayrollForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCalculate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const request: CalculatePayrollRequest = {
      employeeId: Number(form.employeeId),
      payStart: form.payStart,
      payEnd: form.payEnd,
      hourlyRate: Number(form.hourlyRate),
      overtimeRate: Number(form.overtimeRate),
    };

    if (!request.employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (!request.payStart || !request.payEnd) {
      setError(
        'Please select the payroll start and end dates.',
      );
      return;
    }

    if (request.payEnd < request.payStart) {
      setError(
        'Pay end cannot be earlier than pay start.',
      );
      return;
    }

    if (
      request.hourlyRate < 0 ||
      request.overtimeRate < 0
    ) {
      setError(
        'Hourly and overtime rates cannot be negative.',
      );
      return;
    }

    setSubmitting(true);

    try {
      await calculatePayroll(request);

      setSuccess(
        'Payroll calculated successfully.',
      );

      setForm(initialForm);

      await loadPayrollData();

      window.setTimeout(() => {
        setView('list');
      }, 800);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Payroll calculation failed.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(
    payrollId: number,
  ) {
    setProcessingId(payrollId);
    setError('');
    setSuccess('');

    try {
      const response =
        await approvePayroll(payrollId);

      setSuccess(
        response.message ||
          'Payroll approved successfully.',
      );

      await loadPayrollData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to approve payroll.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleMarkPaid(
    payrollId: number,
  ) {
    setProcessingId(payrollId);
    setError('');
    setSuccess('');

    try {
      const response =
        await markPayrollPaid(payrollId);

      setSuccess(
        response.message ||
          'Payroll marked as paid.',
      );

      await loadPayrollData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to mark payroll as paid.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (view === 'calculate') {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Calculate Payroll
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Calculate payroll from employee attendance
            </p>
          </div>

          <button
            type="button"
            onClick={() => setView('list')}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ← Back to Payroll
          </button>
        </div>

        <form
          onSubmit={handleCalculate}
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
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="payrollEmployee"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Employee
              </label>

              <select
                id="payrollEmployee"
                value={form.employeeId}
                onChange={(event) =>
                  updateForm(
                    'employeeId',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              >
                <option value="">
                  Select employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.employeeId}
                    value={employee.employeeId}
                  >
                    {employee.employeeId} -{' '}
                    {employee.name}{' '}
                    {employee.surname}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payStart"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Pay Start
              </label>

              <input
                id="payStart"
                type="date"
                value={form.payStart}
                onChange={(event) =>
                  updateForm(
                    'payStart',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="payEnd"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Pay End
              </label>

              <input
                id="payEnd"
                type="date"
                value={form.payEnd}
                onChange={(event) =>
                  updateForm(
                    'payEnd',
                    event.target.value,
                  )
                }
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="hourlyRate"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Hourly Rate
              </label>

              <input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={form.hourlyRate}
                onChange={(event) =>
                  updateForm(
                    'hourlyRate',
                    event.target.value,
                  )
                }
                required
                placeholder="Example: 100.00"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="overtimeRate"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Overtime Rate
              </label>

              <input
                id="overtimeRate"
                type="number"
                min="0"
                step="0.01"
                value={form.overtimeRate}
                onChange={(event) =>
                  updateForm(
                    'overtimeRate',
                    event.target.value,
                  )
                }
                required
                placeholder="Example: 150.00"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
            Hours worked, overtime, absent days,
            deductions, gross pay, and net pay will
            be calculated automatically from
            attendance records.
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-brand-blue hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              {submitting
                ? 'Calculating...'
                : 'Calculate Payroll'}
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
            Payroll Management
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Calculate, review, approve, and process
            employee payroll
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setView('calculate');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Calculate Payroll
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />

        <input
          type="text"
          placeholder="Search payroll..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
        />
      </div>

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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Pay Start</th>
              <th className="p-4">Pay End</th>
              <th className="p-4">Hours</th>
              <th className="p-4">Overtime</th>
              <th className="p-4">Absent Days</th>
              <th className="p-4">Gross Pay</th>
              <th className="p-4">Deductions</th>
              <th className="p-4">Net Pay</th>
              <th className="p-4">Calculated</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td
                  colSpan={12}
                  className="p-8 text-center text-slate-500"
                >
                  Loading payroll...
                </td>
              </tr>
            ) : filteredPayrolls.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="p-8 text-center text-slate-500"
                >
                  No payroll records found.
                </td>
              </tr>
            ) : (
              filteredPayrolls.map((item) => (
                <tr
                  key={item.payrollId}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {item.employeeName}
                    </div>

                    <div className="font-mono text-xs text-slate-500">
                      ID: {item.employeeId}
                    </div>
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {formatDate(item.payStart)}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {formatDate(item.payEnd)}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {item.hoursWorked.toFixed(2)}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {item.overtimeHours.toFixed(2)}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {item.absentDays}
                  </td>

                  <td className="p-4 text-slate-900 dark:text-slate-100 font-medium">
                    {formatCurrency(item.grossPay)}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.deductions)}
                  </td>

                  <td className="p-4 text-slate-900 dark:text-slate-100 font-semibold">
                    {formatCurrency(item.netPay)}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {formatDateTime(
                      item.calculatedAt,
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : item.status ===
                              'Approved'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {item.status === 'Pending' && (
                        <button
                          type="button"
                          disabled={
                            processingId ===
                            item.payrollId
                          }
                          onClick={() =>
                            void handleApprove(
                              item.payrollId,
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}

                      {item.status ===
                        'Approved' && (
                        <button
                          type="button"
                          disabled={
                            processingId ===
                            item.payrollId
                          }
                          onClick={() =>
                            void handleMarkPaid(
                              item.payrollId,
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold disabled:opacity-50"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      )}

                      {item.status === 'Paid' && (
                        <span className="text-xs text-slate-500">
                          Completed
                        </span>
                      )}
                    </div>
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