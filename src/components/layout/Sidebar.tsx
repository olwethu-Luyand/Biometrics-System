const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'employees', label: 'Employees' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'report', label: 'Report' },
  { id: 'register', label: 'Register Employee' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'profile', label: 'User profile' },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.id} className={`nav-item${item.id === active ? ' active' : ''}`}>
            <a onClick={() => onNavigate(item.id)}>{item.label}</a>
          </li>
        ))}
      </ul>
      <a className="logout-btn" onClick={onLogout}>
        <i className="fa-solid fa-right-from-bracket" />
        <span>Log out</span>
      </a>
    </aside>
  );
}
