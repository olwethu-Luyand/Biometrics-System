import { Loader2, Fingerprint } from 'lucide-react';

interface ClockPageProps {
  mode: 'in' | 'out';
  isBusy: boolean;
  isSupported: boolean;
  error: string | null;
  onClock: () => void;
}

export function ClockPage({ mode, isBusy, isSupported, error, onClock }: ClockPageProps) {
  const isClockIn = mode === 'in';
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="page-title">{isClockIn ? 'Clock in' : 'Clock out'}</h1>
      <p className="welcome-text">{isClockIn ? 'Touch the sensor to start your day' : 'Touch the sensor to end your day'}</p>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
        <h3 className="text-slate-900 dark:text-slate-50 font-semibold mb-2">
          Touch sensor to {isClockIn ? 'clock in' : 'clock out'}
        </h3>

        <div
          className="mx-auto my-6 w-40 h-40 border-2 border-dashed border-brand-blue rounded-2xl flex items-center justify-center cursor-pointer bg-sky-50 dark:bg-brand-blue/10 transition-opacity disabled:opacity-50"
          style={{ opacity: isBusy ? 0.5 : 1, cursor: isBusy ? 'wait' : 'pointer' }}
          onClick={() => { if (!isBusy) onClock(); }}
          title="Touch the fingerprint sensor"
        >
          {isBusy ? (
            <Loader2 className="w-16 h-16 text-brand-blue animate-spin" />
          ) : (
            <Fingerprint className="w-16 h-16 text-brand-blue" />
          )}
        </div>

        {isBusy && <p className="status-message">Touch the fingerprint sensor to verify…</p>}
        {!isSupported && (
          <p className="status-message error">
            Fingerprint authentication is not supported in this browser. Use a secure context (HTTPS or localhost).
          </p>
        )}
        {error && <p className="status-message error">{error}</p>}
      </div>
    </div>
  );
}
