// src/app/core/models/user.interface.ts

// Enum para el estado del usuario
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// Interfaz para el rol del usuario
export interface Role {
  id: number;
  name: string;
}

// Nuevas interfaces para la ESTRUCTURA DE LOS PERFILES ANIDADOS
export interface StudentProfile {
  id: number;
  userId: number; // Campo de enlace al User principal
  code: string;
  program: string;
  semester: number;
}

export interface TeacherProfile {
  id: number;
  userId: number; // Campo de enlace al User principal
  teacherCode: string;
  area: string;
}


// Interfaz base para cualquier usuario
export interface User {
  id: number;
  name: string;
  email: string;
  creationDate: string; // ISO string date
  status: UserStatus;
  roleId: number;
  role?: Role; // Incluido por JOIN en el backend

  // Perfiles anidados que el backend incluye condicionalmente
  student?: StudentProfile; // Será de este tipo si el usuario es un estudiante
  professor?: TeacherProfile; // Será de este tipo si el usuario es un profesor
}

// Interfaz para un estudiante, extiende de User
export interface Student extends User {
  code: string;
  program: string;
  semester: number;
}

// Interfaz para un profesor, extiende de User
export interface Teacher extends User {
  teacherCode: string;
  area: string;
}

// Interfaz para los datos de login que se envían al backend
export interface UserLogin {
  email: string;
  password?: string; // Contraseña puede ser opcional si el sistema lo permite
}

// Interfaz para la respuesta del login del backend
export interface AuthResponse {
  user: User;
  token: string;
}

// Interfaz para la solicitud de creación de usuario
export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string; // La contraseña es opcional si el backend permite creación sin ella o la genera
  userType: 'STUDENT' | 'TEACHER';
  // Campos específicos de estudiante
  code?: string;
  program?: string;
  semester?: number;
  // Campos específicos de profesor
  teacherCode?: string;
  area?: string;
}

// Interfaz para la actualización del estado del usuario
export interface UpdateUserStatusRequest {
  status: UserStatus;
}
