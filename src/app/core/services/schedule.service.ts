import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import {
  ClassSchedule, CreateClassScheduleRequest,
  AvailableSchedule, CreateAvailableScheduleRequest, UpdateAvailableScheduleRequest, DayOfWeek
} from '../models/subject.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private apiService: ApiService) { }

  /**
   * Crea un nuevo horario de clase.
   * @param scheduleData 
   * @returns 
   */
  createClassSchedule(scheduleData: CreateClassScheduleRequest): Observable<ApiResponse<ClassSchedule>> {
    return this.apiService.post<ClassSchedule>('schedules/class', scheduleData);
  }

  /**
   * Obtiene todos los horarios de clase registrados.
   * @returns 
   */
  getAllClassSchedules(): Observable<ApiResponse<ClassSchedule[]>> {
    return this.apiService.get<ClassSchedule[]>('schedules/class');
  }

  /**
   * Obtiene un horario de clase por su ID.
   * @param id
   * @returns 
   */
  getClassScheduleById(id: number): Observable<ApiResponse<ClassSchedule>> {
    return this.apiService.get<ClassSchedule>(`schedules/class/${id}`);
  }

  /**
   * Actualiza un horario de clase.
   * @param id 
   * @param updateData 
   * @returns 
   */
  updateClassSchedule(id: number, updateData: Partial<CreateClassScheduleRequest>): Observable<ApiResponse<ClassSchedule>> {
    return this.apiService.put<ClassSchedule>(`schedules/class/${id}`, updateData);
  }

  /**
   * Elimina un horario de clase.
   * @param id 
   * @returns 
   */
  deleteClassSchedule(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`schedules/class/${id}`);
  }

  /**
   * Obtiene los horarios de clase de un usuario específico.
   * @param userId 
   * @returns
   */
  getClassSchedulesForUser(userId: number): Observable<ApiResponse<ClassSchedule[]>> {
    return this.apiService.get<ClassSchedule[]>(`schedules/class/user/${userId}`);
  }

  /**
   * @param availabilityData 
   * @returns 
   */
  createAvailabilitySchedule(availabilityData: CreateAvailableScheduleRequest): Observable<ApiResponse<AvailableSchedule>> {
    return this.apiService.post<AvailableSchedule>('schedules/availability', availabilityData);
  }

  /**
   * Obtiene todos los horarios de disponibilidad registrados.
   * @returns 
   */
  getAllAvailabilitySchedules(): Observable<ApiResponse<AvailableSchedule[]>> {
    return this.apiService.get<AvailableSchedule[]>('schedules/availability');
  }

  /**
   * Obtiene un horario de disponibilidad por su ID.
   * @param id 
   * @returns 
   */
  getAvailabilityScheduleById(id: number): Observable<ApiResponse<AvailableSchedule>> {
    return this.apiService.get<AvailableSchedule>(`schedules/availability/${id}`);
  }

  /**
   * Actualiza un horario de disponibilidad.
   * @param id 
   * @param updateData 
   */
  updateAvailabilitySchedule(id: number, updateData: UpdateAvailableScheduleRequest): Observable<ApiResponse<AvailableSchedule>> {
    return this.apiService.put<AvailableSchedule>(`schedules/availability/${id}`, updateData);
  }

  /**
   * Elimina un horario de disponibilidad.
   * @param id 
   * @returns 
   */
  deleteAvailabilitySchedule(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`schedules/availability/${id}`);
  }

  /**
   * Obtiene los horarios de disponibilidad de un docente específico.
   * @param teacherId 
   * @returns 
   */
  getAvailabilitySchedulesForTeacher(teacherId: number): Observable<ApiResponse<AvailableSchedule[]>> {
    return this.apiService.get<AvailableSchedule[]>(`schedules/availability/teacher/${teacherId}`);
  }
}
