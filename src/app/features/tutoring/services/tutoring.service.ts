// src/app/features/tutoring/services/tutoring.service.ts
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

  // --- Métodos para Solicitudes de Tutoría (TutoringRequest) ---

  /**
   * Crea una nueva solicitud de tutoría.
   * @param requestData Datos de la solicitud.
   * @returns Observable con la nueva solicitud o advertencia.
   */
  createTutoringRequest(requestData: CreateTutoringRequest): Observable<ApiResponse<TutoringRequest | { request: TutoringRequest, warning: string }>> {
    return this.apiService.post<TutoringRequest | { request: TutoringRequest, warning: string }>('tutorings/requests', requestData);
  }

  /**
   * Obtiene solicitudes de tutoría, opcionalmente filtradas.
   * @param filters Filtros como studentId, teacherId, status.
   * @returns Observable con la lista de solicitudes.
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
   * @param id ID de la solicitud.
   * @returns Observable con la solicitud.
   */
  getTutoringRequestById(id: number): Observable<ApiResponse<TutoringRequest>> {
    return this.apiService.get<TutoringRequest>(`tutorings/requests/${id}`);
  }

  /**
   * Procesa una solicitud de tutoría (aprobar, rechazar, cancelar).
   * @param requestId ID de la solicitud.
   * @param processData Datos del procesamiento (status, rejectionReason).
   * @returns Observable con la solicitud actualizada y/o la tutoría creada.
   */
  processTutoringRequest(requestId: number, processData: ProcessTutoringRequest): Observable<ApiResponse<{ request: TutoringRequest, tutoring?: Tutoring }>> {
    // El tipo dentro de apiService.patch<...> debe ser el tipo de la propiedad 'data' del ApiResponse
    return this.apiService.patch<{ request: TutoringRequest, tutoring?: Tutoring }>(`tutorings/requests/${requestId}/process`, processData);
    // Ya no necesitas el pipe(map) adicional aquí, ya que el tipo genérico resuelve la conversión
  }

  // --- Métodos para Tutorías Agendadas (Tutoring) ---

  /**
   * Obtiene tutorías agendadas, opcionalmente filtradas.
   * @param filters Filtros como studentId, teacherId, status.
   * @returns Observable con la lista de tutorías.
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
   * @param id ID de la tutoría.
   * @returns Observable con la tutoría.
   */
  getTutoringById(id: number): Observable<ApiResponse<Tutoring>> {
    return this.apiService.get<Tutoring>(`tutorings/${id}`);
  }

  /**
   * Cancela una tutoría agendada.
   * @param tutoringId ID de la tutoría a cancelar.
   * @param cancelData Razón de la cancelación.
   * @returns Observable con la respuesta que contiene el mensaje y la tutoría actualizada.
   */
  cancelTutoring(tutoringId: number, cancelData: CancelTutoringRequest): Observable<ApiResponse<{ message: string, tutoring: Tutoring }>> {
    // El tipo genérico pasado a apiService.patch debe ser { message: string, tutoring: Tutoring }
    return this.apiService.patch<{ message: string, tutoring: Tutoring }>(`tutorings/${tutoringId}/cancel`, cancelData);
    // Ya no necesitas el pipe(map) si el tipo genérico es correcto.
  }

  /**
   * Marca el estado de una sesión de tutoría (COMPLETED, NO_SHOW).
   * @param tutoringId ID de la tutoría.
   * @param markData Nuevo estado y observaciones.
   * @returns Observable con la respuesta que contiene el mensaje y la tutoría actualizada.
   */
  markTutoringSession(tutoringId: number, markData: MarkTutoringSessionRequest): Observable<ApiResponse<{ message: string, tutoring: Tutoring }>> {
    // El tipo genérico pasado a apiService.patch debe ser { message: string, tutoring: Tutoring }
    return this.apiService.patch<{ message: string, tutoring: Tutoring }>(`tutorings/${tutoringId}/mark`, markData);
    // Ya no necesitas el pipe(map) si el tipo genérico es correcto.
  }
}
