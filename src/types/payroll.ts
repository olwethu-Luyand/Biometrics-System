export interface CalculatePayrollRequest {
  employeeId: number;
  payStart: string;
  payEnd: string;
  hourlyRate: number;
  overtimeRate: number;
}

export interface PayrollRecord {
  payrollId: number;
  employeeId: number;
  employeeName: string;
  payStart: string;
  payEnd: string;
  hoursWorked: number;
  overtimeHours: number;
  absentDays: number;
  hourlyRate: number;
  overtimeRate: number;
  regularPay: number;
  overtimePay: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: string;
  calculatedAt: string;
}

export interface PayrollActionResponse {
  message: string;
}