import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from './api';

import type {
  CreateReportRequest,
  CreateReportResponse,
  ReportActionResponse,
  ReportRecord,
  ReportStatus,
} from '../types/report';

export function getReports(): Promise<ReportRecord[]> {
  return apiGet<ReportRecord[]>('/Report');
}

export function getReportsByEmployee(
  employeeId: number,
): Promise<ReportRecord[]> {
  return apiGet<ReportRecord[]>(
    `/Report/employee/${employeeId}`,
  );
}

export function createReport(
  request: CreateReportRequest,
): Promise<CreateReportResponse> {
  return apiPost<
    CreateReportResponse,
    CreateReportRequest
  >('/Report', request);
}

export function updateReportStatus(
  reportId: number,
  status: ReportStatus,
): Promise<ReportActionResponse> {
  return apiPut<
    ReportActionResponse,
    { status: ReportStatus }
  >(`/Report/${reportId}/status`, {
    status,
  });
}

export function deleteReport(
  reportId: number,
): Promise<ReportActionResponse> {
  return apiDelete<ReportActionResponse>(
    `/Report/${reportId}`,
  );
}