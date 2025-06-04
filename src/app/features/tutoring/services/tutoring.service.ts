import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../../../core/services/api.service';
import {
  TutoringRequest, Tutoring,
  CreateTutoringRequest, ProcessTutoringRequest,
  MarkTutoringSessionRequest, CancelTutoringRequest,
  RequestStatus, TutoringStatus
} from '../../../core/models/tutoring.interface';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TutoringService {

  constructor(private apiService: ApiService) { }

  /**
   * Crea una nueva solicitud de tutoría.
   * @param requestData 
   * @returns 
   */
  createTutoringRequest(requestData: CreateTutoringRequest): Observable<ApiResponse<TutoringRequest | { request: TutoringRequest, warning: string }>> {
    return this.apiService.post<TutoringRequest | { request: TutoringRequest, warning: string }>('tutorings/requests', requestData);
  }

  /**
   * Obtiene solicitudes de tutoría, opcionalmente filtradas.
   * @param filters 
   * @returns 
   */
  getTutoringRequests(filters?: { studentId?: number, teacherId?: number, status?: RequestStatus }): Observable<ApiResponse<TutoringRequest[]>> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId.toString());
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId.toString());
    if (filters?.status) params = params.set('status', filters.status);
    return this.apiService.get<TutoringRequest[]>('tutorings/requests', params);
  }

  /**
   * Obtiene una solicitud de tutoría por su ID.
   * @param id 
   * @returns
   */
  getTutoringRequestById(id: number): Observable<ApiResponse<TutoringRequest>> {
    return this.apiService.get<TutoringRequest>(`tutorings/requests/${id}`);
  }

  /**
   * Procesa una solicitud de tutoría (aprobar, rechazar, cancelar).
   * @param requestId 
   * @param processData 
   * @returns 
   */
  processTutoringRequest(requestId: number, processData: ProcessTutoringRequest): Observable<ApiResponse<{ request: TutoringRequest, tutoring?: Tutoring }>> {
    return this.apiService.patch<{ request: TutoringRequest, tutoring?: Tutoring }>(`tutorings/requests/${requestId}/process`, processData);
  }


  /**
   * Obtiene tutorías agendadas, opcionalmente filtradas.
   * @param filters 
   * @returns 
   */
  getTutorings(filters?: { studentId?: number, teacherId?: number, status?: TutoringStatus }): Observable<ApiResponse<Tutoring[]>> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId.toString());
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId.toString());
    if (filters?.status) params = params.set('status', filters.status);
    return this.apiService.get<Tutoring[]>('tutorings', params);
  }

  /**
   * Obtiene una tutoría agendada por su ID.
   * @param id 
   * @returns 
   */
  getTutoringById(id: number): Observable<ApiResponse<Tutoring>> {
    return this.apiService.get<Tutoring>(`tutorings/${id}`);
  }

  /**
   * Cancela una tutoría agendada.
   * @param tutoringId 
   * @param cancelData 
   * @returns 
   */
  cancelTutoring(tutoringId: number, cancelData: CancelTutoringRequest): Observable<ApiResponse<{ message: string, tutoring: Tutoring }>> {
    return this.apiService.patch<{ message: string, tutoring: Tutoring }>(`tutorings/${tutoringId}/cancel`, cancelData);
  }

  /**
   * @param tutoringId 
   * @param markData 
   * @returns 
   */
  markTutoringSession(tutoringId: number, markData: MarkTutoringSessionRequest): Observable<ApiResponse<{ message: string, tutoring: Tutoring }>> {
    return this.apiService.patch<{ message: string, tutoring: Tutoring }>(`tutorings/${tutoringId}/mark`, markData);
  }
}
