export function useWebAuthn() {
  const isSupported = typeof window !== 'undefined' && !!navigator?.credentials;

  async function register() {
    if (!isSupported) throw new Error('WebAuthn is not supported on this browser');

    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { id: window.location.hostname, name: 'PrimeOak' },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'user@primeoak.co.za',
          displayName: 'User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      },
    });

    return credential;
  }

  async function authenticate() {
    if (!isSupported) throw new Error('WebAuthn is not supported on this browser');

    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return credential;
  }

  return { register, authenticate, isSupported };
}
