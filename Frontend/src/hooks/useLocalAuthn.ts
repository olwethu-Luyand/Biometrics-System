import { useCallback, useMemo, useState } from 'react';
import { REAL_FINGERPRINT, USE_MOCK } from '../lib/api';

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(length)));
}

const scan = () => new Promise<void>((resolve) => setTimeout(resolve, 1500));

async function enrollFingerprint(): Promise<boolean> {
  try {
    const creationOptions: PublicKeyCredentialCreationOptions = {
      challenge: randomBytes(32),
      rp: { id: window.location.hostname, name: 'PrimeOak Solutions' },
      user: {
        id: randomBytes(16),
        name: 'employee',
        displayName: 'Employee',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      timeout: 60000,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required',
      },
    };
    const credential = (await navigator.credentials.create({
      publicKey: creationOptions,
    })) as PublicKeyCredential | null;
    return credential !== null;
  } catch {
    return false;
  }
}

export function useLocalAuthn() {
  const isSupported = useMemo(
    () =>
      typeof window !== 'undefined' &&
      'PublicKeyCredential' in window &&
      window.isSecureContext,
    [],
  );

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Fingerprint authentication is not supported in this browser');
      return false;
    }
    setIsBusy(true);
    setError(null);
    if (USE_MOCK && !REAL_FINGERPRINT) {
      await scan();
      setIsBusy(false);
      return true;
    }
    try {
      const requestOptions: PublicKeyCredentialRequestOptions = {
        challenge: randomBytes(32),
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: 'required',
      };
      let result: PublicKeyCredential | null = null;
      try {
        result = (await navigator.credentials.get({
          publicKey: requestOptions,
        })) as PublicKeyCredential | null;
      } catch {
        result = null;
      }
      if (!result) {
        const enrolled = await enrollFingerprint();
        if (!enrolled) {
          setError('Could not create a passkey on this device. Check your device fingerprint/passkey settings.');
          return false;
        }
        try {
          result = (await navigator.credentials.get({
            publicKey: requestOptions,
          })) as PublicKeyCredential | null;
        } catch {
          result = null;
        }
      }
      if (!result) {
        setError('Fingerprint verification was cancelled or failed');
        return false;
      }
      return true;
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Fingerprint authentication failed';
      setError(message);
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [isSupported]);

  return { isSupported, isBusy, error, authenticate };
}
