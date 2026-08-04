import { Icon } from '../Icon';

const ALL_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'employees', label: 'Employees' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'report', label: 'Report' },
  { id: 'register', label: 'Register Employee' },
  { id: 'audit', label: 'Audit logs' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'profile', label: 'User profile' },
];

const HR_NAV_IDS = ['dashboard', 'employees', 'attendance', 'report', 'payroll', 'profile'];

interface SidebarProps {
  active: string;
  role: 'admin' | 'hr';
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export function Sidebar({ active, role, onNavigate, onLogout }: SidebarProps) {
  const navItems = role === 'admin' ? ALL_NAV_ITEMS : ALL_NAV_ITEMS.filter((i) => HR_NAV_IDS.includes(i.id));
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
        <Icon name="user" className="w-4 h-4 logout-icon" />
        <span>Log out</span>
      </a>
    </aside>
  );
}
