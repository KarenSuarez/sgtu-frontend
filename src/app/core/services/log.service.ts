// src/app/core/services/log.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { LogEntry, PaginatedLogsResponse } from '../models/report.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene logs del sistema con filtros y paginación.
   * @param filters Objeto con filtros (userId, userEmail, action, startDate, endDate).
   * @param page Número de página.
   * @param limit Límite de resultados por página.
   * @returns Observable con la respuesta paginada de logs.
   */
  getLogs(filters?: { userId?: number, userEmail?: string, action?: string, startDate?: string, endDate?: string }, page: number = 1, limit: number = 20): Observable<ApiResponse<PaginatedLogsResponse>> {
    let params = new HttpParams();
    if (filters?.userId) params = params.set('userId', filters.userId.toString());
    if (filters?.userEmail) params = params.set('userEmail', filters.userEmail);
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    return this.apiService.get<PaginatedLogsResponse>('logs', params);
  }

  /**
   * Genera un informe de auditoría por rango de fechas (datos JSON).
   * @param startDate Fecha de inicio (YYYY-MM-DD).
   * @param endDate Fecha de fin (YYYY-MM-DD).
   * @returns Observable con la lista de LogEntry.
   */
  generateAuditReportData(startDate: string, endDate: string): Observable<ApiResponse<LogEntry[]>> {
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    params = params.set('format', 'JSON'); // Forzar formato JSON para datos
    params = params.set('type', 'SYSTEM_AUDIT'); // Especificar tipo de reporte

    return this.apiService.get<LogEntry[]>('reports', params);
  }
}
