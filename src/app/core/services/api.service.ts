import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
   * @param path 
   * @param params 
   */
  get<T>(path: string, params?: HttpParams): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}/${path}`, { params });
  }

  /**
   * Realiza una solicitud POST a la API.
   * @param path 
   * @param body
   */
  post<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}/${path}`, body);
  }

  /**
   * Realiza una solicitud PUT a la API.
   * @param path 
   * @param body 
   */
  put<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}/${path}`, body);
  }

  /**
   * Realiza una solicitud PATCH a la API.
   * @param path 
   * @param body 
   */
  patch<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.apiUrl}/${path}`, body);
  }

  /**
   *
   * @param path La ruta del endpoint.
   * @param options 
   */
  delete<T>(path: string, options?: {
    body?: any; 
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
   * @param path 
   * @param params 
   * @returns 
   */
  getFile(path: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${path}`, { params, responseType: 'blob' });
  }
}
