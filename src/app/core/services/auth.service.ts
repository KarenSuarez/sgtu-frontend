// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { StorageService } from './storage.service';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators'; // Añadir 'switchMap'
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
    // Inicializar el estado de autenticación y el usuario al cargar el servicio
    // Esto es importante para mantener la sesión si el usuario recarga la página
    if (this.storageService.isLoggedIn()) {
      this._isAuthenticated.next(true);
      // No confíes ciegamente en el usuario guardado en storage. Verifica con el backend.
      this.getAuthenticatedUser().subscribe({
        next: (user) => this._currentUser.next(user),
        error: (err) => {
          console.error('Error al obtener usuario autenticado al iniciar app:', err);
          this._performLocalLogout(); // Si falla, la sesión es inválida
        }
      });
    }
  }

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * @param credentials Objeto con email y password.
   * @returns Observable que emite la respuesta de autenticación.
   */
  login(credentials: UserLogin): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      map(response => {
        if (response.success && response.data) {
          const authData: AuthResponse = response.data;
          this.storageService.saveToken(authData.token);
          // OJO: No guardes directamente authData.user aquí si quieres que siempre se cargue desde /auth/me
          // this.storageService.saveUser(authData.user);
          this._isAuthenticated.next(true);
          return authData;
        } else {
          throw new Error(response.message || 'Error desconocido al iniciar sesión.');
        }
      }),
      // Después de un login exitoso, inmediatamente obtenemos los datos completos del usuario desde /auth/me
      switchMap(authData => this.getAuthenticatedUser().pipe(
        map(user => {
          this.storageService.saveUser(user); // Ahora sí, guarda el usuario completo
          this._currentUser.next(user);
          return authData; // Devuelve los datos de autenticación originales
        }),
        catchError(err => {
          console.error('Error al obtener perfil de usuario después de login:', err);
          this._performLocalLogout(); // Si no podemos obtener el perfil, algo falló gravemente
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

  /**
   * Cierra la sesión del usuario.
   */
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

  /**
   * Realiza el logout a nivel local (limpia almacenamiento y redirige).
   */
  private _performLocalLogout(): void {
    this.storageService.clean();
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Realiza la solicitud GET /api/auth/me para obtener el perfil completo del usuario autenticado.
   * @returns Observable que emite el objeto User.
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
        // Si el token es inválido o expirado, el interceptor de error debería manejar el logout
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la información del usuario actualmente autenticado desde el BehaviorSubject.
   * Es reactivo.
   */
  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Obtiene la información del usuario actualmente autenticado de forma síncrona.
   * Útil para guardias o cuando se necesita el valor actual.
   */
  getUserSync(): User | null {
    return this._currentUser.getValue();
  }

  /**
   * Verifica si el usuario está autenticado.
   */
  isAuthenticated(): boolean {
    return this._isAuthenticated.getValue();
  }

  /**
   * Obtiene el token JWT del usuario actual.
   */
  getToken(): string | null {
    return this.storageService.getToken();
  }
}
