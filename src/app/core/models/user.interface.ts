
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface Role {
  id: number;
  name: string;
}

export interface StudentProfile {
  id: number;
  userId: number; 
  code: string;
  program: string;
  semester: number;
}

export interface TeacherProfile {
  id: number;
  userId: number;
  teacherCode: string;
  area: string;
}


export interface User {
  id: number;
  name: string;
  email: string;
  creationDate: string; 
  status: UserStatus;
  roleId: number;
  role?: Role; 

  student?: StudentProfile; 
  professor?: TeacherProfile; 
}

export interface Student extends User {
  code: string;
  program: string;
  semester: number;
}

export interface Teacher extends User {
  teacherCode: string;
  area: string;
}

export interface UserLogin {
  email: string;
  password?: string; 
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string; 
  userType: 'STUDENT' | 'TEACHER';
  code?: string;
  program?: string;
  semester?: number;
  teacherCode?: string;
  area?: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}
