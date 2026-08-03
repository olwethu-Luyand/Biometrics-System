import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuth } from './lib/api';
import { Sidebar } from './components/layout/Sidebar';
import logo from './assets/logo.jpeg';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { ReportPage } from './pages/ReportPage';
import { RegisterEmployeePage } from './pages/RegisterEmployeePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { PayrollPage } from './pages/PayrollPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { TermsPage } from './components/auth/TermsPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activePage, setActivePage] = useState('dashboard');
  const [authPage, setAuthPage] = useState<'auth' | 'terms'>('auth');

  if (!isAuthenticated) {
    if (authPage === 'terms') {
      return <TermsPage onBack={() => setAuthPage('auth')} />;
    }
    return authMode === 'signin' ? (
      <SignIn onSignIn={() => setIsAuthenticated(true)} onSwitchToSignUp={() => setAuthMode('signup')} />
    ) : (
      <SignUp onSignUp={() => setIsAuthenticated(true)} onSwitchToSignIn={() => setAuthMode('signin')} onTermsClick={() => setAuthPage('terms')} />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'employees': return <EmployeesPage />;
      case 'attendance': return <AttendancePage />;
      case 'report': return <ReportPage />;
      case 'register': return <RegisterEmployeePage />;
      case 'audit': return <AuditLogsPage />;
      case 'payroll': return <PayrollPage />;
      case 'profile': return <UserProfilePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar active={activePage} onNavigate={setActivePage} onLogout={() => { clearAuth(); setIsAuthenticated(false); }} />
      <div className="main-area">
        <header className="topnav">
          <div className="topnav-left">
            <img src={logo} alt="PrimeOak" className="topnav-logo" />
          </div>
          <div className="topnav-right">
            <span className="topnav-user">Olwethu Xaba</span>
            <div className="topnav-avatar">OX</div>
          </div>
        </header>
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
