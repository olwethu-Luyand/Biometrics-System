import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import banner from '../../assets/prime_oak.jpeg';

const VALID_EMAIL = 'admin@primeoak.co.za';
const VALID_PASSWORD = 'password123';

interface SignInProps {
  onSignIn: () => void;
  onSwitchToSignUp: () => void;
}

export function SignIn({ onSignIn, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bioLoading, setBioLoading] = useState(false);
  const { authenticate, isSupported } = useWebAuthn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError('Invalid email or password');
      return;
    }
    onSignIn();
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
            Welcome Back
          </motion.h2>
          <p className="auth-subtitle">Please enter your details</p>
          <div className="auth-tabs">
            <div className="auth-tab active">Sign in</div>
            <div className="auth-tab" onClick={onSwitchToSignUp}>Sign up</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot password</a>
            <button type="submit" className="btn-primary">Sign in</button>
          </form>

          {isSupported && (
            <div className="mt-4 text-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <button
                type="button"
                disabled={bioLoading}
                onClick={async () => {
                  setBioLoading(true);
                  setError('');
                  try {
                    await authenticate();
                    onSignIn();
                  } catch {
                    setError('Fingerprint authentication failed');
                  } finally {
                    setBioLoading(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-50"
              >
                <Fingerprint className={`w-5 h-5 ${bioLoading ? 'animate-pulse text-brand-blue' : ''}`} />
                {bioLoading ? 'Scanning...' : 'Sign in with fingerprint'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
