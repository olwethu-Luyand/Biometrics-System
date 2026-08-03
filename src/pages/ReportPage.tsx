import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  FilePlus2,
  Search,
  Trash2,
} from 'lucide-react';

import { getEmployees } from '../services/employeeService';

import {
  createReport,
  deleteReport,
  getReports,
  updateReportStatus,
} from '../services/reportService';

import type { Employee } from '../types/employee';

import type {
  CreateReportRequest,
  ReportRecord,
  ReportStatus,
} from '../types/report';

interface ReportForm {
  employeeId: string;
  title: string;
  description: string;
}

const initialForm: ReportForm = {
  employeeId: '',
  title: '',
  description: '',
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Closed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';

    case 'In Progress':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400';

    default:
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
  }
}

export function ReportPage() {
  const [view, setView] =
    useState<'list' | 'create'>('list');

  const [reports, setReports] =
    useState<ReportRecord[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [form, setForm] =
    useState<ReportForm>(initialForm);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReportData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [reportRecords, employeeRecords] =
        await Promise.all([
          getReports(),
          getEmployees(),
        ]);

      setReports(reportRecords);
      setEmployees(employeeRecords);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load reports.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReportData();
  }, [loadReportData]);

  const filteredReports = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return reports;
    }

    return reports.filter((report) => {
      return (
        report.title.toLowerCase().includes(value) ||
        report.description
          .toLowerCase()
          .includes(value) ||
        report.employeeName
          ?.toLowerCase()
          .includes(value) ||
        report.employeeId
          .toString()
          .includes(value) ||
        report.status.toLowerCase().includes(value)
      );
    });
  }, [reports, search]);

  function updateForm(
    field: keyof ReportForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateReport(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const request: CreateReportRequest = {
      employeeId: Number(form.employeeId),
      title: form.title.trim(),
      description: form.description.trim(),
    };

    if (!request.employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (!request.title || !request.description) {
      setError(
        'The title and description are required.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await createReport(request);

      setSuccess(
        response.message ||
          'Report created successfully.',
      );

      setForm(initialForm);

      await loadReportData();

      window.setTimeout(() => {
        setView('list');
      }, 800);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create the report.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(
    reportId: number,
    status: ReportStatus,
  ) {
    setProcessingId(reportId);
    setError('');
    setSuccess('');

    try {
      const response = await updateReportStatus(
        reportId,
        status,
      );

      setSuccess(
        response.message ||
          'Report status updated successfully.',
      );

      await loadReportData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to update report status.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(reportId: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this report?',
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(reportId);
    setError('');
    setSuccess('');

    try {
      const response = await deleteReport(reportId);

      setSuccess(
        response.message ||
          'Report deleted successfully.',
      );

      await loadReportData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to delete the report.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (view === 'create') {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Create a report
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Log a report against an employee
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setView('list');
              setError('');
              setSuccess('');
              setForm(initialForm);
            }}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ← Back to Reports
          </button>
        </div>

        <form
          onSubmit={handleCreateReport}
          className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm"
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

          <div className="space-y-2">
            <label
              htmlFor="reportEmployee"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Employee
            </label>

            <select
              id="reportEmployee"
              value={form.employeeId}
              onChange={(event) =>
                updateForm(
                  'employeeId',
                  event.target.value,
                )
              }
              required
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            >
              <option value="">
                Select an employee
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.employeeId}
                  value={employee.employeeId}
                >
                  {employee.employeeId} -{' '}
                  {employee.name} {employee.surname}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reportTitle"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Title
            </label>

            <input
              id="reportTitle"
              type="text"
              maxLength={150}
              value={form.title}
              onChange={(event) =>
                updateForm(
                  'title',
                  event.target.value,
                )
              }
              placeholder="Example: Repeated absence"
              required
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reportDescription"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>

            <textarea
              id="reportDescription"
              rows={5}
              value={form.description}
              onChange={(event) =>
                updateForm(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Add details for this report..."
              required
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-colors"
          >
            {submitting
              ? 'Saving report...'
              : 'Save report'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Employee Reports
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and manage reports written for employees
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setView('create');
            setError('');
            setSuccess('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm"
        >
          <FilePlus2 className="w-4 h-4" />
          Create Report
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />

        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
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
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4">Created</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500"
                >
                  Loading reports...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500"
                >
                  No reports found.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr
                  key={report.reportId}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {report.employeeName ||
                        `Employee ${report.employeeId}`}
                    </div>

                    <div className="font-mono text-xs text-slate-500">
                      ID: {report.employeeId}
                    </div>
                  </td>

                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                    {report.title}
                  </td>

                  <td className="p-4 max-w-sm whitespace-normal text-slate-600 dark:text-slate-400">
                    {report.description}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {formatDate(report.createdAt)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                        report.status,
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={report.status}
                        disabled={
                          processingId === report.reportId
                        }
                        onChange={(event) =>
                          void handleStatusChange(
                            report.reportId,
                            event.target
                              .value as ReportStatus,
                          )
                        }
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <option value="Open">
                          Open
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Closed">
                          Closed
                        </option>
                      </select>

                      <button
                        type="button"
                        disabled={
                          processingId === report.reportId
                        }
                        onClick={() =>
                          void handleDelete(
                            report.reportId,
                          )
                        }
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/50 dark:text-red-400"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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