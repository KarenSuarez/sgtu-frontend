
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

export interface TutoringRequest {
  id: number;
  studentId: number;
  teacherId: number;
  subjectId: number;
  requestDate: string; 
  desiredDate: string; 
  startTime: string; 
  endTime: string; 
  message?: string;
  status: RequestStatus;
  rejectionReason?: string;
  student?: { id: number, user: { name: string, email: string } };
  teacher?: { id: number, user: { name: string, email: string } };
  subject?: { id: number, name: string, code: string };
}

export interface Tutoring {
  id: number;
  studentId: number;
  teacherId: number;
  subjectId: number;
  startDate: string; 
  endDate: string; 
  status: TutoringStatus;
  observations?: string;
  resources?: string[];
  tutoringRequestId?: number;
  student?: { id: number, user: { name: string, email: string } };
  teacher?: { id: number, user: { name: string, email: string } };
  subject?: { id: number, name: string, code: string };
}

export interface CreateTutoringRequest {
  studentId: number;
  teacherId: number;
  subjectId: number;
  desiredDate: string; 
  startTime: string; 
  endTime: string; 
  message?: string | null;
}

export interface ProcessTutoringRequest {
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
}

export interface MarkTutoringSessionRequest {
  status: 'COMPLETED' | 'NO_SHOW';
  observations?: string;
}

export interface CancelTutoringRequest {
  reason?: string;
}
