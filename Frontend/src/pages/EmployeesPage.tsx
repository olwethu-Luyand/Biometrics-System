import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useTableVersion } from '../lib/supabaseRealtime';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

interface SupabaseRow {
  employee_id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

function mapRow(row: SupabaseRow): Employee {
  return {
    id: row.employee_id,
    employeeId: row.employee_id,
    name: row.name,
    surname: row.surname,
    email: row.email,
    role: row.role,
  };
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [source, setSource] = useState<'supabase' | 'mock'>('mock');
  const version = useTableVersion('users');

  useEffect(() => {
    let cancelled = false;

    const loadFromSupabase = async (): Promise<boolean> => {
      if (!supabase) return false;
      const { data, error: supabaseError } = await supabase
        .from('employee_roster')
        .select('employee_id, name, surname, email, role')
        .limit(100);
      if (supabaseError || !data) return false;
      if (!cancelled) {
        setEmployees((data as SupabaseRow[]).map(mapRow));
        setSource('supabase');
        setError('');
      }
      return true;
    };

    const loadFromMock = async () => {
      try {
        const res = await apiRequest<{ data: Employee[] }>('/api/employees');
        if (!cancelled) {
          setEmployees(res.data);
          setSource('mock');
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load employees');
        }
      }
    };

    void loadFromSupabase().then((usedSupabase) => {
      if (!usedSupabase && !cancelled) void loadFromMock();
    });

    return () => {
      cancelled = true;
    };
  }, [version]);

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
      <p className="text-xs text-slate-400 mb-4">
        Data source: {source === 'supabase' ? 'Supabase' : 'Mock API'}
      </p>
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
