import { Icon } from '../Icon';

const navItems: { id: string; label: string; icon: 'present' | 'clock' | 'working' | 'absent' | 'profile' }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'present' },
  { id: 'clock-in', label: 'Clock in', icon: 'clock' },
  { id: 'clock-out', label: 'Clock out', icon: 'clock' },
  { id: 'history', label: 'My history', icon: 'working' },
  { id: 'reports', label: 'Reports', icon: 'absent' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

interface EmployeeSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export function EmployeeSidebar({ active, onNavigate, onLogout }: EmployeeSidebarProps) {
  return (
    <aside className="sidebar">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.id} className={`nav-item${item.id === active ? ' active' : ''}`}>
            <a onClick={() => onNavigate(item.id)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Icon name={item.icon} className="w-4 h-4" alt={item.label} />
                {item.label}
              </span>
            </a>
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
