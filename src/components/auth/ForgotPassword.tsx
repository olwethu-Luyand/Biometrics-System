import {
  useState,
  type FormEvent,
} from 'react';
import { motion } from 'framer-motion';
import banner from '../../assets/prime_oak.jpeg';

import {
  forgotPassword,
  resetPassword,
} from '../../services/authService';

interface ForgotPasswordProps {
  onBackToSignIn: () => void;
}

type ResetStep = 'email' | 'reset' | 'success';

export function ForgotPassword({
  onBackToSignIn,
}: ForgotPasswordProps) {
  const [step, setStep] =
    useState<ResetStep>('email');

  const [emailAddress, setEmailAddress] =
    useState('');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] =
    useState('');

  async function handleRequestOtp(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(
        emailAddress.trim(),
      );

      setMessage(
        response.message ||
          'If the email exists, a reset OTP has been sent.',
      );

      setStep('reset');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to request a reset OTP.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('OTP must contain six digits.');
      return;
    }

    if (newPassword.length < 8) {
      setError(
        'The new password must contain at least 8 characters.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        'The passwords do not match.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        emailAddress.trim(),
        otp,
        newPassword,
      );

      setMessage(
        response.message ||
          'Password reset successfully.',
      );

      setStep('success');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to reset the password.',
      );
    } finally {
      setLoading(false);
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
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >
          <motion.h2
            className="auth-title"
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            {step === 'email'
              ? 'Forgot Password'
              : step === 'reset'
                ? 'Reset Password'
                : 'Password Updated'}
          </motion.h2>

          <p className="auth-subtitle">
            {step === 'email'
              ? 'Enter your account email address'
              : step === 'reset'
                ? `Enter the OTP sent to ${emailAddress}`
                : 'Your password has been changed successfully'}
          </p>

          {step === 'email' && (
            <form onSubmit={handleRequestOtp}>
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email address"
                  value={emailAddress}
                  onChange={(event) =>
                    setEmailAddress(
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading
                  ? 'Sending OTP...'
                  : 'Send Reset OTP'}
              </button>

              <button
                type="button"
                onClick={onBackToSignIn}
                className="mt-3 w-full text-sm text-slate-500 hover:text-brand-blue"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
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
                  type="password"
                  className="form-control"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success">
                  {message}
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
                  ? 'Resetting password...'
                  : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                  setMessage('');
                }}
                className="mt-3 w-full text-sm text-slate-500 hover:text-brand-blue"
              >
                ← Request another OTP
              </button>
            </form>
          )}

          {step === 'success' && (
            <div>
              {message && (
                <p className="auth-success">
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={onBackToSignIn}
                className="btn-primary"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}