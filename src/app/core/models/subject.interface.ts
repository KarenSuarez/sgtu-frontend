
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  area?: string;
  status: boolean;
}

export interface ClassSchedule {
  id: number;
  subjectId: number;
  userId: number; 
  dayOfWeek: DayOfWeek;
  startTime: string; 
  endTime: string; 
  classroom?: string;
  subject?: { id: number, name: string, code: string };
  user?: { id: number, name: string, email: string };
}

export interface AvailableSchedule {
  id: number;
  teacherId: number;
  dayOfWeek?: DayOfWeek | null; 
  specificDate?: string | null; 
  startTime: string; 
  endTime: string; 
  available: boolean;
  teacher?: { id: number, teacherCode: string, area: string };
}

export interface CreateSubjectRequest {
  code: string;
  name: string;
  credits: number;
  area?: string;
  status?: boolean;
}

export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  credits?: number;
  area?: string;
  status?: boolean;
}

export interface UserSubjectAssociation {
  userId: number;
  subjectId: number;
}

export interface CreateClassScheduleRequest {
  subjectId: number;
  userId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
}

export interface CreateAvailableScheduleRequest {
  teacherId: number;
  dayOfWeek?: DayOfWeek  | null;
  specificDate?: string  | null;
  startTime: string;
  endTime: string;
  available?: boolean;
}

export interface UpdateAvailableScheduleRequest {
  teacherId?: number;
  dayOfWeek?: DayOfWeek | null;
  specificDate?: string | null;
  startTime?: string;
  endTime?: string;
  available?: boolean;
}
