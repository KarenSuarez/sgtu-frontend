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
   * .
   * @param filters 
   * @param page 
   * @param limit 
   * @returns 
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
   * 
   * @param startDate 
   * @param endDate 
   * @returns 
   */
  generateAuditReportData(startDate: string, endDate: string): Observable<ApiResponse<LogEntry[]>> {
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    params = params.set('format', 'JSON'); 
    params = params.set('type', 'SYSTEM_AUDIT'); 

    return this.apiService.get<LogEntry[]>('reports', params);
  }
}
