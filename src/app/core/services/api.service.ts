// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para la respuesta estándar del backend
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Realiza una solicitud GET a la API.
   * @param path La ruta del endpoint (ej. 'users/1').
   * @param params Parámetros de la consulta (opcional).
   */
  get<T>(path: string, params?: HttpParams): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}/${path}`, { params });
  }

  /**
   * Realiza una solicitud POST a la API.
   * @param path La ruta del endpoint.
   * @param body El cuerpo de la solicitud.
   */
  post<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}/${path}`, body);
  }

  /**
   * Realiza una solicitud PUT a la API.
   * @param path La ruta del endpoint.
   * @param body El cuerpo de la solicitud.
   */
  put<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}/${path}`, body);
  }

  /**
   * Realiza una solicitud PATCH a la API.
   * @param path La ruta del endpoint.
   * @param body El cuerpo de la solicitud.
   */
  patch<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.apiUrl}/${path}`, body);
  }

  /**
   * Realiza una solicitud DELETE a la API.
   * Ahora acepta un objeto de opciones para mayor flexibilidad,
   * permitiendo enviar un 'body' en DELETE si el backend lo requiere.
   * @param path La ruta del endpoint.
   * @param options Opciones de la solicitud (incluye body, headers, params, etc.).
   */
  delete<T>(path: string, options?: {
    body?: any; // <-- Permite enviar un cuerpo en la solicitud DELETE
    headers?: HttpHeaders | { [header: string]: string | string[]; };
    params?: HttpParams | { [param: string]: string | string[]; };
    observe?: 'body';
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.apiUrl}/${path}`, options);
  }

  /**
   * Realiza una solicitud GET que espera una respuesta de tipo blob (ej. archivos).
   * @param path La ruta del endpoint.
   * @param params Parámetros de la consulta (opcional).
   * @returns Observable<Blob>
   */
  getFile(path: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${path}`, { params, responseType: 'blob' });
  }
}
