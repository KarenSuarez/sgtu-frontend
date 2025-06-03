// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importa AuthService para logout
import { CustomAlertComponent } from '../../shared/components/custom-alert/custom-alert.component'; // Si quieres usar el componente de alerta directamente (requiere un servicio para mostrarlo globalmente)

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      let customAlertRef: any; // Puedes usar esto si tienes un servicio para mostrar alertas

      // Manejo de errores específicos
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente o de red
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0: // Error de red o CORS no configurado
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión o el estado del backend.';
            break;
          case 401: // No autorizado (token inválido o expirado)
            errorMessage = 'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.';
            router.navigate(['/auth/login']); // Redirige al login
            break;
          case 403: // Prohibido (permisos insuficientes)
            errorMessage = 'No tienes permiso para realizar esta acción.';
            // Opcional: redirigir a una página de "acceso denegado"
            break;
          case 404: // No encontrado
            errorMessage = 'El recurso solicitado no fue encontrado.';
            break;
          case 409: // Conflicto (ej. dato duplicado, conflicto de horario)
            errorMessage = `Conflicto: ${error.error?.message || 'Ya existe un recurso con estos datos.'}`;
            break;
          case 500: // Error interno del servidor
            errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde.';
            break;
          default:
            // Otros errores del servidor (ej. 4xx)
            errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
        }
      }

      // Si tienes un servicio global de alertas (recomendado), lo usarías aquí
      // Ejemplo: inject(AlertService).show(errorMessage, 'error');

      // Por ahora, solo lo logeamos y lanzamos el error para que el componente que hizo la llamada lo maneje si es necesario.
      console.error('Error interceptado:', errorMessage, error);
      return throwError(() => new Error(errorMessage)); // Lanza un nuevo error con un mensaje amigable
    })
  );
};
