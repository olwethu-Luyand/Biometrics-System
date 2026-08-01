import { Icon } from '../components/Icon';

const employees = [
  { name: 'Boitumelo Magashula', title: 'Employee', number: '00001111' },
  { name: 'Mooketsi Mogale', title: 'Employee', number: '00002222' },
  { name: 'Bokang Ngwetjana', title: 'HR Management', number: '00003333' },
  { name: 'Paballo Diphoko', title: 'HR Management', number: '00004444' },
  { name: 'Bongiwe Siboza', title: 'Employee', number: '00005555' },
  { name: 'Junior Mphefo', title: 'Employee', number: '00006666' },
];

export function EmployeesPage() {
  return (
    <>
      <h1 className="page-title">Employee overview</h1>
      <br />
      <div className="search-box">
        <Icon name="search" className="w-4 h-4 search-icon" />
        <input type="text" placeholder="Search employee" />
      </div>
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
            {employees.map((emp) => (
              <tr key={emp.number}>
                <td>{emp.name}</td>
                <td>{emp.title}</td>
                <td>{emp.number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
