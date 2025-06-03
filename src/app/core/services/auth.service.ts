import { Injectable } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { StorageService } from './storage.service';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators'; 
import { User, AuthResponse, UserLogin } from '../models/user.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {
  
    if (this.storageService.isLoggedIn()) {
      this._isAuthenticated.next(true);
      this.getAuthenticatedUser().subscribe({
        next: (user) => this._currentUser.next(user),
        error: (err) => {
          console.error('Error al obtener usuario autenticado al iniciar app:', err);
          this._performLocalLogout(); 
        }
      });
    }
  }

  /**
   * @param credentials 
   * @returns 
   */
  login(credentials: UserLogin): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      map(response => {
        if (response.success && response.data) {
          const authData: AuthResponse = response.data;
          this.storageService.saveToken(authData.token);
          this._isAuthenticated.next(true);
          return authData;
        } else {
          throw new Error(response.message || 'Error desconocido al iniciar sesión.');
        }
      }),
      switchMap(authData => this.getAuthenticatedUser().pipe(
        map(user => {
          this.storageService.saveUser(user); 
          this._currentUser.next(user);
          return authData; 
        }),
        catchError(err => {
          console.error('Error al obtener perfil de usuario después de login:', err);
          this._performLocalLogout(); 
          return throwError(() => new Error('Error al cargar perfil de usuario.'));
        })
      )),
      catchError(error => {
        console.error('Error en el servicio de autenticación (login):', error);
        this._isAuthenticated.next(false);
        this._currentUser.next(null);
        return throwError(() => error);
      })
    );
  }
  
  logout(): void {
    this.apiService.post('auth/logout', {}).pipe(
      catchError(error => {
        console.warn('Error al llamar al endpoint de logout del backend, pero se procede con el logout local:', error);
        return of(null);
      })
    ).subscribe(() => {
      this._performLocalLogout();
    });
  }

  private _performLocalLogout(): void {
    this.storageService.clean();
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Realiza la solicitud GET /api/auth/me para obtener el perfil completo del usuario autenticado.
   * @returns 
   */
  getAuthenticatedUser(): Observable<User> {
    return this.apiService.get<User>('auth/me').pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'No se pudo obtener el perfil del usuario.');
      }),
      catchError(error => {
        console.error('Error al obtener /auth/me:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUser$;
  }

  getUserSync(): User | null {
    return this._currentUser.getValue();
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated.getValue();
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }
}
