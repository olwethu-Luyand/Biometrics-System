export interface HrEmployee {
  employeeId: number
  name: string
  surname: string
  emailAddress: string
  role: string
}

export interface LoginResponse {
  message: string
  requiresOtp?: boolean
  expiresInMinutes?: number
}

export interface VerifyOtpResponse {
  message: string
  token: string
  expiresInMinutes: number
  employee: HrEmployee
}