import {
  apiGet,
  apiPost,
  apiPut,
} from './api';

import type {
  CalculatePayrollRequest,
  PayrollActionResponse,
  PayrollRecord,
} from '../types/payroll';

export function getPayrolls(): Promise<PayrollRecord[]> {
  return apiGet<PayrollRecord[]>('/Payroll');
}

export function calculatePayroll(
  request: CalculatePayrollRequest,
): Promise<PayrollRecord> {
  return apiPost<
    PayrollRecord,
    CalculatePayrollRequest
  >('/Payroll/calculate', request);
}

export function approvePayroll(
  payrollId: number,
): Promise<PayrollActionResponse> {
  return apiPut<
    PayrollActionResponse,
    undefined
  >(`/Payroll/${payrollId}/approve`);
}

export function markPayrollPaid(
  payrollId: number,
): Promise<PayrollActionResponse> {
  return apiPut<
    PayrollActionResponse,
    undefined
  >(`/Payroll/${payrollId}/mark-paid`);
}