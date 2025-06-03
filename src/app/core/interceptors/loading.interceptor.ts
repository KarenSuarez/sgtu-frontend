// src/app/core/interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service'; // Importa el nuevo LoadingService

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.show(); // Muestra el spinner al inicio de la solicitud

  return next(req).pipe(
    finalize(() => {
      loadingService.hide(); // Oculta el spinner cuando la solicitud finaliza (éxito o error)
    })
  );
};
