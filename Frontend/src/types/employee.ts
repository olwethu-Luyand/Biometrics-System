export interface Employee {
  employeeId: number
  name: string
  surname: string
  role: string
  emailAddress: string
  scannerDeviceId: string | null
  fingerprintEnrolled: boolean
  fingerprintEnrolledAt: string | null
}

export interface RegisterEmployeeRequest {
  name: string
  surname: string
  role: string
  password: string
  emailAddress: string
  fingerprintTemplate?: string | null
  scannerDeviceId?: string | null
}

export interface RegisterEmployeeResponse {
  message: string
  employee: Employee
}