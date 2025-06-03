// src/app/core/models/report.interface.ts

// Enum para los tipos de reporte
export enum ReportType {
  TUTORINGS_COMPLETED = 'TUTORINGS_COMPLETED',
  STUDENT_ATTENDANCE = 'STUDENT_ATTENDANCE',
  TEACHER_PERFORMANCE = 'TEACHER_PERFORMANCE',
  GENERAL_STATISTICS = 'GENERAL_STATISTICS',
  SYSTEM_AUDIT = 'SYSTEM_AUDIT'
}

// Enum para los formatos de reporte
export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  CSV = 'CSV'
}

// Interfaz para un LogEntry (basado en el modelo de MongoDB)
export interface LogEntry {
  _id: string;
  timestamp: string; // ISO string date-time
  userId?: number;
  userEmail?: string;
  action: string; // Corresponde al ActionType enum del backend
  details?: any; // Objeto flexible
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string; // Si timestamps: true en MongoDB
  updatedAt?: string; // Si timestamps: true en MongoDB
}

// Interfaz para la respuesta de logs paginada
export interface PaginatedLogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaz para los parámetros de generación de reportes
export interface ReportGenerationParams {
  type: ReportType;
  format: ReportFormat;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  studentId?: number;
  teacherId?: number;
}

// Interfaz para una Notificación (modelo de MongoDB)
export interface Notification {
  _id: string;
  type: string; // Corresponde al NotificationType enum del backend
  recipientId: number;
  recipientEmail: string;
  message: string;
  creationDate: string; // ISO string date-time
  read: boolean;
  metadata?: any; // Objeto flexible
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para la respuesta de notificaciones paginada
export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaz para una configuración del sistema
export interface SystemConfiguration {
  _id: string;
  key: string;
  value: any; // El valor puede ser de cualquier tipo
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para la solicitud de establecer una configuración
export interface SetConfigurationRequest {
  value: any;
  description?: string;
}
