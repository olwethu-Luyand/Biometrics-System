import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Icon } from '../components/Icon';
import { getEmployees } from '../services/employeeService';
import type { Employee } from '../types/employee';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
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
        setLoading(false);
      }
    }

    void loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName =
        `${employee.name} ${employee.surname}`.toLowerCase();

      return (
        fullName.includes(value) ||
        employee.role.toLowerCase().includes(value) ||
        employee.emailAddress.toLowerCase().includes(value) ||
        employee.employeeId.toString().includes(value)
      );
    });
  }, [employees, search]);

  return (
    <>
      <h1 className="page-title">
        Employee overview
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
              <th>Full Name</th>
              <th>Role</th>
              <th>Employee Number</th>
              <th>Email Address</th>
              <th>Fingerprint</th>
              <th>Scanner Device</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>
                    {employee.name}{' '}
                    {employee.surname}
                  </td>

                  <td>{employee.role}</td>

                  <td>{employee.employeeId}</td>

                  <td>{employee.emailAddress}</td>

                  <td>
                    {employee.fingerprintEnrolled
                      ? 'Enrolled'
                      : 'Not enrolled'}
                  </td>

                  <td>
                    {employee.scannerDeviceId ||
                      'Not assigned'}
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
