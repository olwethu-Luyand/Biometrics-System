import { apiPost } from './api'
import type {
  HrEmployee,
  LoginResponse,
  VerifyOtpResponse,
} from '../types/auth'

export interface RegisterHrRequest {
  name: string;
  surname: string;
  emailAddress: string;
  password: string;
}

export interface RegisterHrResponse {
  message: string;
  employee: {
    employeeId: number;
    name: string;
    surname: string;
    role: string;
    emailAddress: string;
    fingerprintEnrolled: boolean;
    fingerprintEnrolledAt: string | null;
  };
}

export function registerHr(
  request: RegisterHrRequest,
): Promise<RegisterHrResponse> {
  return apiPost<
    RegisterHrResponse,
    RegisterHrRequest
  >('/Auth/register-hr', request);
}

export function login(
  emailAddress: string,
  password: string,
): Promise<LoginResponse> {
  return apiPost<
    LoginResponse,
    {
      emailAddress: string
      password: string
    }
  >('/Auth/login', {
    emailAddress,
    password,
  })
}

export async function verifyLoginOtp(
  emailAddress: string,
  otp: string,
  location: string,
): Promise<VerifyOtpResponse> {
  const response = await apiPost<
    VerifyOtpResponse,
    {
      emailAddress: string
      otp: string
      location: string
    }
  >('/Auth/verify-login-otp', {
    emailAddress,
    otp,
    location,
  })

  if (response.employee.role !== 'HR') {
    throw new Error(
      'This dashboard is only available to HR users.',
    )
  }

  sessionStorage.setItem('token', response.token)
  sessionStorage.setItem(
    'employee',
    JSON.stringify(response.employee),
  )

  return response
}

export interface ForgotPasswordResponse {
  message: string;
  expiresInMinutes?: number;
}

export interface ResetPasswordResponse {
  message: string;
}

export function forgotPassword(
  emailAddress: string,
): Promise<ForgotPasswordResponse> {
  return apiPost<
    ForgotPasswordResponse,
    {
      emailAddress: string;
    }
  >('/Auth/forgot-password', {
    emailAddress,
  });
}

export function resetPassword(
  emailAddress: string,
  otp: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return apiPost<
    ResetPasswordResponse,
    {
      emailAddress: string;
      otp: string;
      newPassword: string;
    }
  >('/Auth/reset-password', {
    emailAddress,
    otp,
    newPassword,
  });
}

export function getCurrentHr(): HrEmployee | null {
  const storedEmployee = sessionStorage.getItem('employee')

  if (!storedEmployee) {
    return null
  }

  try {
    const employee = JSON.parse(
      storedEmployee,
    ) as HrEmployee

    return employee.role === 'HR'
      ? employee
      : null
  } catch {
    return null
  }
}

export function isHrAuthenticated(): boolean {
  return Boolean(
    sessionStorage.getItem('token') &&
      getCurrentHr(),
  )
}

export function clearAuthentication(): void {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('employee')
  sessionStorage.removeItem('pendingLoginEmail')
}