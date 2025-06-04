// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 
import { CustomAlertComponent } from '../../shared/components/custom-alert/custom-alert.component'; 

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      let customAlertRef: any; 

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0: 
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión o el estado del backend.';
            break;
          case 401:
            errorMessage = 'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.';
            router.navigate(['/auth/login']); 
            break;
          case 403: 
            errorMessage = 'No tienes permiso para realizar esta acción.';
            break;
          case 404: 
            errorMessage = 'El recurso solicitado no fue encontrado.';
            break;
          case 409: 
            errorMessage = `Conflicto: ${error.error?.message || 'Ya existe un recurso con estos datos.'}`;
            break;
          case 500: 
            errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
        }
      }

      console.error('Error interceptado:', errorMessage, error);
      return throwError(() => new Error(errorMessage)); 
    })
  );
};
