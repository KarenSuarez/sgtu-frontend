// src/app/features/asignaturas/services/subject.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../../../core/services/api.service';
import {
  Subject, CreateSubjectRequest, UpdateSubjectRequest,
  UserSubjectAssociation
} from '../../../core/models/subject.interface';
import { User } from '../../../core/models/user.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  constructor(private apiService: ApiService) { }

  /**
   * Crea una nueva asignatura.
   * @param subjectData Datos de la asignatura.
   * @returns Observable con la nueva asignatura.
   */
  createSubject(subjectData: CreateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.apiService.post<Subject>('subjects', subjectData);
  }

  /**
   * Obtiene todas las asignaturas.
   * @returns Observable con la lista de asignaturas.
   */
  getAllSubjects(): Observable<ApiResponse<Subject[]>> {
    return this.apiService.get<Subject[]>('subjects');
  }

  /**
   * Obtiene una asignatura por su ID.
   * @param id ID de la asignatura.
   * @returns Observable con la asignatura.
   */
  getSubjectById(id: number): Observable<ApiResponse<Subject>> {
    return this.apiService.get<Subject>(`subjects/${id}`);
  }

  /**
   * Actualiza una asignatura.
   * @param id ID de la asignatura a actualizar.
   * @param updateData Datos a actualizar.
   * @returns Observable con la asignatura actualizada.
   */
  updateSubject(id: number, updateData: UpdateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.apiService.put<Subject>(`subjects/${id}`, updateData);
  }

  /**
   * Elimina una asignatura.
   * @param id ID de la asignatura a eliminar.
   * @returns Observable con el mensaje de éxito.
   */
  deleteSubject(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`subjects/${id}`);
  }

  /**
   * Asocia un usuario a una asignatura.
   * @param associationData Datos de la asociación (userId, subjectId).
   * @returns Observable con el mensaje de éxito.
   */
  addUserToSubject(associationData: UserSubjectAssociation): Observable<ApiResponse<any>> {
    return this.apiService.post<any>('subjects/associate-user', associationData);
  }

  /**
   * Desasocia un usuario de una asignatura.
   * @param associationData Datos de la desasociación (userId, subjectId).
   * @returns Observable con el mensaje de éxito.
   */
  removeUserFromSubject(associationData: UserSubjectAssociation): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>('subjects/dissociate-user', { body: associationData }); // DELETE con body
  }

  /**
   * Obtiene las asignaturas asociadas a un usuario específico.
   * @param userId ID del usuario.
   * @returns Observable con la lista de asignaturas.
   */
  getSubjectsForUser(userId: number): Observable<ApiResponse<Subject[]>> {
    return this.apiService.get<Subject[]>(`subjects/user/${userId}`);
  }

  /**
   * Obtiene los docentes que imparten una asignatura específica.
   * @param subjectId ID de la asignatura.
   * @returns Observable con la lista de usuarios (docentes).
   */
  getTeachersBySubject(subjectId: number): Observable<ApiResponse<User[]>> {
    return this.apiService.get<User[]>(`subjects/${subjectId}/teachers`);
  }
}
