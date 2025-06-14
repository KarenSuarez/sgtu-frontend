import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../../../core/services/api.service';
import { ReportGenerationParams, ReportFormat, ReportType } from '../../../core/models/report.interface';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private apiService: ApiService) { }

  /**
   * Genera un reporte y lo descarga como un archivo.
   * @param params
   * @returns 
   */
  generateAndDownloadReport(params: ReportGenerationParams): Observable<Blob> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('type', params.type);
    httpParams = httpParams.set('format', params.format);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.studentId) httpParams = httpParams.set('studentId', params.studentId.toString());
    if (params.teacherId) httpParams = httpParams.set('teacherId', params.teacherId.toString());

    return this.apiService.getFile('reports', httpParams).pipe(
      map(blob => blob) 
    );
  }

  /**
   * Genera un reporte en formato JSON y lo devuelve como datos.
   * @param params 
   * @returns 
   */
  generateReportData<T>(params: Omit<ReportGenerationParams, 'format'>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('type', params.type);
    httpParams = httpParams.set('format', ReportFormat.JSON); 
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.studentId) httpParams = httpParams.set('studentId', params.studentId.toString());
    if (params.teacherId) httpParams = httpParams.set('teacherId', params.teacherId.toString());

    return this.apiService.get<T>('reports', httpParams);
  }
}
