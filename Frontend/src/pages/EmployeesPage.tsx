import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { apiRequest } from '../lib/api';

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ data: Employee[] }>('/api/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load employees'));
  }, []);

  const filtered = employees.filter((emp) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [emp.name, emp.surname, emp.employeeId].some((field) => field.toLowerCase().includes(q));
  });

  return (
    <>
      <h1 className="page-title">Employee overview</h1>
      <br />
      <div className="search-box">
        <Icon name="search" className="w-4 h-4 search-icon" />
        <input type="text" placeholder="Search employee" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Job title</th>
              <th>Employee number</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name} {emp.surname}</td>
                <td>{emp.role}</td>
                <td>{emp.employeeId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
