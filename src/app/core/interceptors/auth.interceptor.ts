// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getToken();

  // Define las URLs que NO requieren un token (endpoints públicos)
  // Generalmente, solo el endpoint de login y quizás el de registro de usuario (si es auto-registro público)
  const isLoginRequest = req.url.includes('/auth/login');
  const isUserCreationPost = req.url.includes('/users') && req.method === 'POST';

  // Solo añade el token si hay uno disponible Y la solicitud NO es a una URL pública.
  if (token && !isLoginRequest && !isUserCreationPost) { // Simplificamos la condición
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Para URLs públicas o si no hay token, continúa con la solicitud original.
  return next(req);
};
