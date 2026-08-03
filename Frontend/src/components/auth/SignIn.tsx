import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import {
  login,
  verifyLoginOtp,
} from '../../services/authService';
import banner from '../../assets/prime_oak.jpeg';

interface SignInProps {
  onSignIn: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

type SignInStep = 'credentials' | 'otp';

export function SignIn({
  onSignIn,
  onSwitchToSignUp,
  onForgotPassword,
}: SignInProps) {
  const [step, setStep] =
    useState<SignInStep>('credentials');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [location, setLocation] =
    useState('Office A');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] =
    useState(false);

  const { authenticate, isSupported } =
    useWebAuthn();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await login(
        email.trim(),
        password,
      );

      sessionStorage.setItem(
        'pendingLoginEmail',
        email.trim(),
      );

      setMessage(
        response.message ||
          'An OTP was sent to your email address.',
      );

      setStep('otp');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Login failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await verifyLoginOtp(
        email.trim(),
        otp,
        location.trim() || 'Office A',
      );

      sessionStorage.removeItem(
        'pendingLoginEmail',
      );

      onSignIn();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'OTP verification failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  function returnToSignIn() {
    setStep('credentials');
    setOtp('');
    setError('');
    setMessage('');
  }

  async function handleFingerprintSignIn() {
    setBioLoading(true);
    setError('');
    setMessage('');

    try {
      await authenticate();

      setMessage(
        'Biometric verification succeeded. Complete email and OTP authentication to access the HR dashboard.',
      );
    } catch {
      setError(
        'Fingerprint authentication failed.',
      );
    } finally {
      setBioLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div
        className="auth-left"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

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
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
          >
            {step === 'credentials'
              ? 'Welcome Back'
              : 'Verify OTP'}
          </motion.h2>

          <p className="auth-subtitle">
            {step === 'credentials'
              ? 'Please enter your details'
              : `Enter the OTP sent to ${email}`}
          </p>

          <div className="auth-tabs">
            <div className="auth-tab active">
              Sign in
            </div>

            <div
              className="auth-tab"
              onClick={onSwitchToSignUp}
            >
              Sign up
            </div>
          </div>

          {step === 'credentials' ? (
            <>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email address"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="current-password"
                    required
                  />
                </div>

                {message && (
                  <p className="auth-success">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="auth-error">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  className="forgot-link"
                  onClick={onForgotPassword}
                >
                  Forgot password
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? 'Signing in...'
                    : 'Sign in'}
                </button>
              </form>

              {isSupported && (
                <div className="mt-4 text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />

                    <span className="text-xs text-slate-400">
                      or
                    </span>

                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <button
                    type="button"
                    disabled={bioLoading}
                    onClick={() =>
                      void handleFingerprintSignIn()
                    }
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-50"
                  >
                    <Fingerprint
                      className={`w-5 h-5 ${
                        bioLoading
                          ? 'animate-pulse text-brand-blue'
                          : ''
                      }`}
                    />

                    {bioLoading
                      ? 'Scanning...'
                      : 'Sign in with fingerprint'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-control"
                  placeholder="Six-digit OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6),
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Workstation location"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              {message && (
                <p className="auth-success">
                  {message}
                </p>
              )}

              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={
                  loading || otp.length !== 6
                }
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify OTP'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={returnToSignIn}
                className="mt-3 w-full text-sm text-slate-500 hover:text-brand-blue"
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}