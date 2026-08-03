export type ReportStatus =
  | 'Open'
  | 'In Progress'
  | 'Closed';

export interface CreateReportRequest {
  employeeId: number;
  title: string;
  description: string;
}

export interface ReportRecord {
  reportId: number;
  employeeId: number;
  employeeName?: string;
  emailAddress?: string;
  title: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportResponse {
  message: string;
  report: ReportRecord;
}

export interface ReportActionResponse {
  message: string;
}