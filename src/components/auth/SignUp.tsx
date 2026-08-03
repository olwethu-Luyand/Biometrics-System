import {
  useState,
  type FormEvent,
} from 'react';
import { motion } from 'framer-motion';
import banner from '../../assets/prime_oak.jpeg';
import { registerHr } from '../../services/authService';

interface SignUpProps {
  onSwitchToSignIn: () => void;
  onTermsClick: () => void;
}

export function SignUp({
  onSwitchToSignIn,
  onTermsClick,
}: SignUpProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [emailAddress, setEmailAddress] =
    useState('');
  const [password, setPassword] = useState('');
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await registerHr({
        name: name.trim(),
        surname: surname.trim(),
        emailAddress: emailAddress
          .trim()
          .toLowerCase(),
        password,
      });

      setSuccess(
        response.message ||
          'HR account created successfully.',
      );

      /*
       * Registration does not authenticate the HR.
       * The new HR must sign in and complete OTP verification.
       */
      window.setTimeout(() => {
        onSwitchToSignIn();
      }, 1200);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create the HR account.',
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
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
          >
            Create an HR account
          </motion.h2>

          <p className="auth-subtitle">
            Register an authorised HR user
          </p>

          <div className="auth-tabs">
            <div
              className="auth-tab"
              onClick={onSwitchToSignIn}
            >
              Sign in
            </div>

            <div className="auth-tab active">
              Sign up
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Surname"
                  value={surname}
                  onChange={(event) =>
                    setSurname(event.target.value)
                  }
                  required
                />
              </div>
            </div>

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

            <div className="form-group">
              <input
                type="text"
                className="form-control"
                value="HR"
                readOnly
                aria-label="Account role"
              />
            </div>

            <div className="form-row">
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
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm Password"
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
            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-success">
                {success}
              </p>
            )}

            <div className="terms-text">
              <input
                type="checkbox"
                id="terms"
                required
              />

              <label htmlFor="terms">
                By signing up, you agree to our{' '}
                <a
                  href="#"
                  style={{
                    color: '#0077c8',
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    onTermsClick();
                  }}
                >
                  Terms and Conditions
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create HR account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}