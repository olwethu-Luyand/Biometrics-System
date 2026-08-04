import { apiRequest, REAL_FINGERPRINT, USE_MOCK } from '../lib/api';
import { mockAuthForEmployee } from '../lib/mock';
import { saveWebAuthnCredential } from '../lib/supabaseDb';

const scan = () => new Promise<void>((resolve) => setTimeout(resolve, 1500));

export function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : '';
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface RegisterOptions {
  challenge: string;
  rp: { id: string; name: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection: AuthenticatorSelectionCriteria;
  timeout: number;
  excludeCredentials: PublicKeyCredentialDescriptor[];
}

interface AuthenticateOptions {
  challenge: string;
  rpId: string;
  timeout: number;
  userVerification: UserVerificationRequirement;
  allowCredentials: PublicKeyCredentialDescriptor[];
}

interface AuthResponse {
  token: string;
  user: { id: number; fullName: string; email: string; role: string };
}

interface RegisterVerifyResponse {
  message: string;
  credentialId: string;
}

export function useWebAuthn() {
  const isSupported = typeof window !== 'undefined' && !!navigator?.credentials;

  async function register(employeeId: string) {
    if (!isSupported) throw new Error('WebAuthn is not supported on this browser');

    if (USE_MOCK && !REAL_FINGERPRINT) {
      const options = await apiRequest<RegisterOptions>('/api/webauthn/register/options', {
        method: 'POST',
        body: { employeeId },
      });
      void options;
      await scan();
      const result = { message: 'Biometric registered', credentialId: `mock-${employeeId}` } as RegisterVerifyResponse;
      await saveWebAuthnCredential(employeeId, result.credentialId, 'Simulated scan');
      return result;
    }

    const options = await apiRequest<RegisterOptions>('/api/webauthn/register/options', {
      method: 'POST',
      body: { employeeId },
    });

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: fromBase64Url(options.challenge),
        rp: options.rp,
        user: { ...options.user, id: fromBase64Url(options.user.id) },
        pubKeyCredParams: options.pubKeyCredParams,
        authenticatorSelection: options.authenticatorSelection,
        timeout: options.timeout,
        excludeCredentials: options.excludeCredentials.map((c) => ({ ...c, id: fromBase64Url(String(c.id)) })),
      },
    })) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAttestationResponse;

    const result = await apiRequest<RegisterVerifyResponse>('/api/webauthn/register/verify', {
      method: 'POST',
      body: {
        employeeId,
        id: credential.id,
        rawId: toBase64Url(credential.rawId),
        type: credential.type,
        deviceName: 'Platform authenticator',
        response: {
          clientDataJSON: toBase64Url(response.clientDataJSON),
          attestationObject: toBase64Url(response.attestationObject),
        },
      },
    });
    await saveWebAuthnCredential(employeeId, result.credentialId, 'Platform authenticator');
    return result;
  }

  async function authenticate(employeeId: string) {
    if (!isSupported) throw new Error('WebAuthn is not supported on this browser');

    if (USE_MOCK && !REAL_FINGERPRINT) {
      await scan();
      return mockAuthForEmployee(employeeId);
    }

    const options = await apiRequest<AuthenticateOptions>('/api/webauthn/authenticate/options', {
      method: 'POST',
      body: { employeeId },
      token: null,
    });

    let credential: PublicKeyCredential;
    try {
      credential = (await navigator.credentials.get({
        publicKey: {
          challenge: fromBase64Url(options.challenge),
          rpId: options.rpId,
          timeout: options.timeout,
          userVerification: options.userVerification,
          allowCredentials: options.allowCredentials.map((c) => ({ ...c, id: fromBase64Url(String(c.id)) })),
        },
      })) as PublicKeyCredential;
    } catch {
      throw new Error('No fingerprint registered on this device for PrimeOak. Register the employee biometric first.');
    }

    const response = credential.response as AuthenticatorAssertionResponse;

    return apiRequest<AuthResponse>('/api/webauthn/authenticate/verify', {
      method: 'POST',
      body: {
        employeeId,
        id: credential.id,
        rawId: toBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: toBase64Url(response.clientDataJSON),
          authenticatorData: toBase64Url(response.authenticatorData),
          signature: toBase64Url(response.signature),
        },
      },
      token: null,
    });
  }

  return { register, authenticate, isSupported };
}
