// src/app/core/services/schedule.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import {
  ClassSchedule, CreateClassScheduleRequest,
  AvailableSchedule, CreateAvailableScheduleRequest, UpdateAvailableScheduleRequest, DayOfWeek
} from '../models/subject.interface'; // Importar interfaces relacionadas con horarios
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private apiService: ApiService) { }

  // --- Métodos para Horarios de Clase (ClassSchedule) ---

  /**
   * Crea un nuevo horario de clase.
   * @param scheduleData Datos del horario de clase.
   * @returns Observable con el nuevo horario de clase.
   */
  createClassSchedule(scheduleData: CreateClassScheduleRequest): Observable<ApiResponse<ClassSchedule>> {
    return this.apiService.post<ClassSchedule>('schedules/class', scheduleData);
  }

  /**
   * Obtiene todos los horarios de clase registrados.
   * @returns Observable con la lista de horarios de clase.
   */
  getAllClassSchedules(): Observable<ApiResponse<ClassSchedule[]>> {
    return this.apiService.get<ClassSchedule[]>('schedules/class');
  }

  /**
   * Obtiene un horario de clase por su ID.
   * @param id ID del horario de clase.
   * @returns Observable con el horario de clase.
   */
  getClassScheduleById(id: number): Observable<ApiResponse<ClassSchedule>> {
    return this.apiService.get<ClassSchedule>(`schedules/class/${id}`);
  }

  /**
   * Actualiza un horario de clase.
   * @param id ID del horario de clase a actualizar.
   * @param updateData Datos a actualizar.
   * @returns Observable con el horario de clase actualizado.
   */
  updateClassSchedule(id: number, updateData: Partial<CreateClassScheduleRequest>): Observable<ApiResponse<ClassSchedule>> {
    return this.apiService.put<ClassSchedule>(`schedules/class/${id}`, updateData);
  }

  /**
   * Elimina un horario de clase.
   * @param id ID del horario de clase a eliminar.
   * @returns Observable con el mensaje de éxito.
   */
  deleteClassSchedule(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`schedules/class/${id}`);
  }

  /**
   * Obtiene los horarios de clase de un usuario específico.
   * @param userId ID del usuario (estudiante o profesor).
   * @returns Observable con la lista de horarios de clase del usuario.
   */
  getClassSchedulesForUser(userId: number): Observable<ApiResponse<ClassSchedule[]>> {
    return this.apiService.get<ClassSchedule[]>(`schedules/class/user/${userId}`);
  }

  // --- Métodos para Horarios de Disponibilidad (AvailableSchedule) ---

  /**
   * Crea un nuevo horario de disponibilidad para un docente.
   * @param availabilityData Datos del horario de disponibilidad.
   * @returns Observable con el nuevo horario de disponibilidad.
   */
  createAvailabilitySchedule(availabilityData: CreateAvailableScheduleRequest): Observable<ApiResponse<AvailableSchedule>> {
    return this.apiService.post<AvailableSchedule>('schedules/availability', availabilityData);
  }

  /**
   * Obtiene todos los horarios de disponibilidad registrados.
   * @returns Observable con la lista de horarios de disponibilidad.
   */
  getAllAvailabilitySchedules(): Observable<ApiResponse<AvailableSchedule[]>> {
    return this.apiService.get<AvailableSchedule[]>('schedules/availability');
  }

  /**
   * Obtiene un horario de disponibilidad por su ID.
   * @param id ID del horario de disponibilidad.
   * @returns Observable con el horario de disponibilidad.
   */
  getAvailabilityScheduleById(id: number): Observable<ApiResponse<AvailableSchedule>> {
    return this.apiService.get<AvailableSchedule>(`schedules/availability/${id}`);
  }

  /**
   * Actualiza un horario de disponibilidad.
   * @param id ID del horario de disponibilidad a actualizar.
   * @param updateData Datos a actualizar.
   * @returns Observable con el horario de disponibilidad actualizado.
   */
  updateAvailabilitySchedule(id: number, updateData: UpdateAvailableScheduleRequest): Observable<ApiResponse<AvailableSchedule>> {
    return this.apiService.put<AvailableSchedule>(`schedules/availability/${id}`, updateData);
  }

  /**
   * Elimina un horario de disponibilidad.
   * @param id ID del horario de disponibilidad a eliminar.
   * @returns Observable con el mensaje de éxito.
   */
  deleteAvailabilitySchedule(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`schedules/availability/${id}`);
  }

  /**
   * Obtiene los horarios de disponibilidad de un docente específico.
   * @param teacherId ID del docente.
   * @returns Observable con la lista de horarios de disponibilidad del docente.
   */
  getAvailabilitySchedulesForTeacher(teacherId: number): Observable<ApiResponse<AvailableSchedule[]>> {
    return this.apiService.get<AvailableSchedule[]>(`schedules/availability/teacher/${teacherId}`);
  }
}
