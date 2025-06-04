export enum ReportType {
  TUTORINGS_COMPLETED = 'TUTORINGS_COMPLETED',
  STUDENT_ATTENDANCE = 'STUDENT_ATTENDANCE',
  TEACHER_PERFORMANCE = 'TEACHER_PERFORMANCE',
  GENERAL_STATISTICS = 'GENERAL_STATISTICS',
  SYSTEM_AUDIT = 'SYSTEM_AUDIT'
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  CSV = 'CSV'
}

export interface LogEntry {
  _id: string;
  timestamp: string; 
  userId?: number;
  userEmail?: string;
  action: string; 
  details?: any; 
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string; 
  updatedAt?: string; 
}

export interface PaginatedLogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportGenerationParams {
  type: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;   
  studentId?: number;
  teacherId?: number;
}

export interface Notification {
  _id: string;
  type: string; 
  recipientId: number;
  recipientEmail: string;
  message: string;
  creationDate: string; 
  read: boolean;
  metadata?: any; 
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemConfiguration {
  _id: string;
  key: string;
  value: any; 
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetConfigurationRequest {
  value: any;
  description?: string;
}
