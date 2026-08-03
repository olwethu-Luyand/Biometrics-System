import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Icon } from '../components/Icon';
import { getEmployees } from '../services/employeeService';
import { apiGet } from '../services/api';
import type { Employee } from '../types/employee';

interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  attendanceDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalWorkedHours: number;
  overtimeHours: number;
  status: string;
}

interface AttendanceRow extends AttendanceRecord {
  employeeName: string;
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

function formatTime(value: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function AttendancePage() {
  const [records, setRecords] =
    useState<AttendanceRow[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      setError('');

      try {
        const [attendance, employees] =
          await Promise.all([
            apiGet<AttendanceRecord[]>('/Attendance'),
            getEmployees(),
          ]);

        const employeeMap = new Map<
          number,
          Employee
        >(
          employees.map((employee) => [
            employee.employeeId,
            employee,
          ]),
        );

        const rows: AttendanceRow[] =
          attendance.map((record) => {
            const employee = employeeMap.get(
              record.employeeId,
            );

            return {
              ...record,
              employeeName: employee
                ? `${employee.name} ${employee.surname}`
                : `Employee ${record.employeeId}`,
            };
          });

        setRecords(rows);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load attendance records.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return records;
    }

    return records.filter((record) => {
      return (
        record.employeeName
          .toLowerCase()
          .includes(value) ||
        record.employeeId
          .toString()
          .includes(value) ||
        record.status
          .toLowerCase()
          .includes(value) ||
        record.attendanceDate.includes(value)
      );
    });
  }, [records, search]);

  return (
    <>
      <h1 className="page-title">
        Attendance overview
      </h1>

      <br />

      <div className="search-box">
        <Icon
          name="search"
          className="w-4 h-4 search-icon"
        />

        <input
          type="text"
          placeholder="Search employee"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {error && (
        <p className="auth-error">
          {error}
        </p>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Hours worked</th>
              <th>Overtime Hrs</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  Loading attendance...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.attendanceId}>
                  <td>{record.employeeName}</td>

                  <td>{record.employeeId}</td>

                  <td>
                    {formatDate(
                      record.attendanceDate,
                    )}
                  </td>

                  <td>
                    {formatTime(
                      record.clockInTime,
                    )}
                  </td>

                  <td>
                    {formatTime(
                      record.clockOutTime,
                    )}
                  </td>

                  <td>
                    {record.totalWorkedHours.toFixed(
                      2,
                    )}
                  </td>

                  <td>
                    {record.overtimeHours.toFixed(
                      2,
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        record.status.toLowerCase() ===
                        'present'
                          ? 'present'
                          : 'absent'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}