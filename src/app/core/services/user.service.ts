// src/app/core/services/user.service.ts
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
   * Crea un nuevo usuario (estudiante o docente).
   * @param userData Datos del usuario a crear.
   * @returns Observable con el nuevo usuario.
   */
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.post<User>('users', userData);
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id ID del usuario.
   * @returns Observable con el usuario.
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.apiService.get<User>(`users/${id}`);
  }

  /**
   * Actualiza un usuario.
   * @param id ID del usuario a actualizar.
   * @param updateData Datos a actualizar.
   * @returns Observable con el usuario actualizado.
   */
  updateUser(id: number, updateData: Partial<CreateUserRequest>): Observable<ApiResponse<User>> {
    return this.apiService.put<User>(`users/${id}`, updateData);
  }

  /**
   * Cambia el estado de un usuario (ACTIVE, INACTIVE, SUSPENDED).
   * @param id ID del usuario.
   * @param status Nuevo estado.
   * @returns Observable con el usuario actualizado.
   */
  changeUserStatus(id: number, status: UserStatus): Observable<ApiResponse<User>> {
    const body: UpdateUserStatusRequest = { status };
    return this.apiService.patch<User>(`users/${id}/status`, body);
  }

  /**
   * Obtiene todos los usuarios por su rol.
   * @param role Rol de los usuarios a obtener.
   * @returns Observable con la lista de usuarios.
   */
  getAllUsersByRole(role: string): Observable<ApiResponse<User[]>> {
    let httpParams = new HttpParams(); // Crea una nueva instancia de HttpParams
    httpParams = httpParams.set('role', role); // Añade el parámetro 'role'

    // Pasa la instancia de HttpParams directamente como segundo argumento
    return this.apiService.get<User[]>(`users`, httpParams);
  }
  // Puedes añadir otros métodos para obtener listas de usuarios, etc.
}
