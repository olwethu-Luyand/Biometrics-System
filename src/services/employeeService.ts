import { apiGet, apiPost, apiPut } from './api'
import type {
  Employee,
  RegisterEmployeeRequest,
  RegisterEmployeeResponse,
} from '../types/employee'

export function getEmployees(): Promise<Employee[]> {
  return apiGet<Employee[]>('/Employee')
}

export function getEmployee(
  employeeId: number,
): Promise<Employee> {
  return apiGet<Employee>(`/Employee/${employeeId}`)
}

export function registerEmployee(
  request: RegisterEmployeeRequest,
): Promise<RegisterEmployeeResponse> {
  return apiPost<
    RegisterEmployeeResponse,
    RegisterEmployeeRequest
  >('/Employee', request)
}

export interface UpdateEmployeeRequest {
  name: string;
  surname: string;
  role: string;
  emailAddress: string;
  password?: string | null;
}

export interface UpdateEmployeeResponse {
  message: string;
  employee: Employee;
}

export function updateEmployee(
  employeeId: number,
  request: UpdateEmployeeRequest,
): Promise<UpdateEmployeeResponse> {
  return apiPut<
    UpdateEmployeeResponse,
    UpdateEmployeeRequest
  >(`/Employee/${employeeId}`, request);
}