// src/app/core/models/tutoring.interface.ts

// Enums para los estados de solicitudes y tutorías
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum TutoringStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// Interfaz base para una Solicitud de Tutoría
export interface TutoringRequest {
  id: number;
  studentId: number;
  teacherId: number;
  subjectId: number;
  requestDate: string; // ISO string date
  desiredDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  message?: string;
  status: RequestStatus;
  rejectionReason?: string;
  // Propiedades opcionales para inclusiones
  student?: { id: number, user: { name: string, email: string } };
  teacher?: { id: number, user: { name: string, email: string } };
  subject?: { id: number, name: string, code: string };
}

// Interfaz base para una Tutoría Agendada
export interface Tutoring {
  id: number;
  studentId: number;
  teacherId: number;
  subjectId: number;
  startDate: string; // ISO string date-time
  endDate: string; // ISO string date-time
  status: TutoringStatus;
  observations?: string;
  resources?: string[];
  tutoringRequestId?: number;
  // Propiedades opcionales para inclusiones
  student?: { id: number, user: { name: string, email: string } };
  teacher?: { id: number, user: { name: string, email: string } };
  subject?: { id: number, name: string, code: string };
}

// Interfaz para la solicitud de creación de una TutoringRequest
export interface CreateTutoringRequest {
  studentId: number;
  teacherId: number;
  subjectId: number;
  desiredDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  message?: string | null;
}

// Interfaz para procesar una solicitud de tutoría (aprobar/rechazar)
export interface ProcessTutoringRequest {
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
}

// Interfaz para marcar el estado de una sesión de tutoría
export interface MarkTutoringSessionRequest {
  status: 'COMPLETED' | 'NO_SHOW';
  observations?: string;
}

// Interfaz para cancelar una tutoría (agendada)
export interface CancelTutoringRequest {
  reason?: string;
}
