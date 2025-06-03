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
   * @param subjectData 
   * @returns 
   */
  createSubject(subjectData: CreateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.apiService.post<Subject>('subjects', subjectData);
  }

  /**
   * @returns 
   */
  getAllSubjects(): Observable<ApiResponse<Subject[]>> {
    return this.apiService.get<Subject[]>('subjects');
  }

  /**
   * Obtiene una asignatura por su ID.
   * @param id 
   * @returns 
   */
  getSubjectById(id: number): Observable<ApiResponse<Subject>> {
    return this.apiService.get<Subject>(`subjects/${id}`);
  }

  /**
   * Actualiza una asignatura.
   * @param id 
   * @param updateData 
   * @returns 
   */
  updateSubject(id: number, updateData: UpdateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.apiService.put<Subject>(`subjects/${id}`, updateData);
  }

  /**
   * Elimina una asignatura.
   * @param id 
   * @returns 
   */
  deleteSubject(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`subjects/${id}`);
  }

  /**
   * Asocia un usuario a una asignatura.
   * @param associationData 
   * @returns 
   */
  addUserToSubject(associationData: UserSubjectAssociation): Observable<ApiResponse<any>> {
    return this.apiService.post<any>('subjects/associate-user', associationData);
  }

  /**
   * Desasocia un usuario de una asignatura.
   * @param associationData 
   * @returns 
   */
  removeUserFromSubject(associationData: UserSubjectAssociation): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>('subjects/dissociate-user', { body: associationData }); // DELETE con body
  }

  /**
   * Obtiene las asignaturas asociadas a un usuario específico.
   * @param userId 
   * @returns 
   */
  getSubjectsForUser(userId: number): Observable<ApiResponse<Subject[]>> {
    return this.apiService.get<Subject[]>(`subjects/user/${userId}`);
  }

  /**
   * Obtiene los docentes que imparten una asignatura específica.
   * @param subjectId 
   * @returns 
   */
  getTeachersBySubject(subjectId: number): Observable<ApiResponse<User[]>> {
    return this.apiService.get<User[]>(`subjects/${subjectId}/teachers`);
  }
}
