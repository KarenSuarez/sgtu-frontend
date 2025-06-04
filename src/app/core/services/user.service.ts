import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { User, CreateUserRequest, UpdateUserStatusRequest, UserStatus } from '../models/user.interface';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  /**
   * @param userData
   * @returns 
   */
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.post<User>('users', userData);
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id 
   * @returns 
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.apiService.get<User>(`users/${id}`);
  }

  /**
   * Actualiza un usuario.
   * @param id 
   * @param updateData 
   * @returns 
   */
  updateUser(id: number, updateData: Partial<CreateUserRequest>): Observable<ApiResponse<User>> {
    return this.apiService.put<User>(`users/${id}`, updateData);
  }

  /**
   * Cambia el estado de un usuario 
   * @param id 
   * @param status
   * @returns 
   */
  changeUserStatus(id: number, status: UserStatus): Observable<ApiResponse<User>> {
    const body: UpdateUserStatusRequest = { status };
    return this.apiService.patch<User>(`users/${id}/status`, body);
  }

  /**
   * Obtiene todos los usuarios por su rol.
   * @param role 
   * @returns 
   */
  getAllUsersByRole(role: string): Observable<ApiResponse<User[]>> {
    let httpParams = new HttpParams(); 
    httpParams = httpParams.set('role', role); 

    return this.apiService.get<User[]>(`users`, httpParams);
  }
}
