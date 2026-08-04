import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiRequest, setAuth, USE_MOCK, type ApiUser } from '../../lib/api';
import banner from '../../assets/prime_oak.jpeg';

interface SignUpProps {
  onSignUp: () => void;
  onSwitchToSignIn: () => void;
  onTermsClick: () => void;
}

export function SignUp({ onSignUp, onSwitchToSignIn, onTermsClick }: SignUpProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      if (USE_MOCK) {
        await apiRequest('/api/employees', {
          method: 'POST',
          body: { name, surname, email, role: role || 'Employee', employeeId: idNumber, password },
        });
        const res = await apiRequest<{ token: string; user: ApiUser }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
          token: null,
        });
        setAuth(res.token, res.user);
      }
      onSignUp();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left" style={{ backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      </div>
      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.h2
            className="auth-title"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Create an account
          </motion.h2>
          <p className="auth-subtitle">Please enter your details</p>
          <div className="auth-tabs">
            <div className="auth-tab" onClick={onSwitchToSignIn}>Sign in</div>
            <div className="auth-tab active">Sign up</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="text" className="form-control" placeholder="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <input type="email" className="form-control" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="password" className="form-control" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="terms-text">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">By signing up, you agree to our <a href="#" style={{ color: '#0077c8' }} onClick={(e) => { e.preventDefault(); onTermsClick(); }}>Terms and Conditions</a>.</label>
            </div>
            <button type="submit" className="btn-primary">Sign up</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
