// src/app/core/models/subject.interface.ts

// Enum para los días de la semana
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

// Interfaz para Asignatura
export interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  area?: string;
  status: boolean;
}

// Interfaz para Horario de Clase
export interface ClassSchedule {
  id: number;
  subjectId: number;
  userId: number; // ID del estudiante o profesor asociado a este horario
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  classroom?: string;
  // Propiedades opcionales para inclusiones
  subject?: { id: number, name: string, code: string };
  user?: { id: number, name: string, email: string };
}

// Interfaz para Horario de Disponibilidad del Docente
export interface AvailableSchedule {
  id: number;
  teacherId: number;
  dayOfWeek?: DayOfWeek | null; // Requiere 'dayOfWeek' O 'specificDate', no ambos
  specificDate?: string | null; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  available: boolean;
  // Propiedades opcionales para inclusiones
  teacher?: { id: number, teacherCode: string, area: string };
}

// Interfaz para crear una Asignatura
export interface CreateSubjectRequest {
  code: string;
  name: string;
  credits: number;
  area?: string;
  status?: boolean;
}

// Interfaz para actualizar una Asignatura
export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  credits?: number;
  area?: string;
  status?: boolean;
}

// Interfaz para asociar/desasociar usuario-asignatura
export interface UserSubjectAssociation {
  userId: number;
  subjectId: number;
}

// Interfaz para crear un Horario de Clase
export interface CreateClassScheduleRequest {
  subjectId: number;
  userId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
}

// Interfaz para crear un Horario de Disponibilidad
export interface CreateAvailableScheduleRequest {
  teacherId: number;
  dayOfWeek?: DayOfWeek  | null;
  specificDate?: string  | null;
  startTime: string;
  endTime: string;
  available?: boolean;
}

// Interfaz para actualizar un Horario de Disponibilidad
export interface UpdateAvailableScheduleRequest {
  teacherId?: number;
  dayOfWeek?: DayOfWeek | null;
  specificDate?: string | null;
  startTime?: string;
  endTime?: string;
  available?: boolean;
}
