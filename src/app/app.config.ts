// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http'; // Importa HttpClientModule y provideHttpClient
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Importa tu interceptor
import { errorInterceptor } from './core/interceptors/error.interceptor'; // Importa tu interceptor
import { loadingInterceptor } from './core/interceptors/loading.interceptor'; // Importa tu interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Configura HttpClient para usar interceptores
    provideHttpClient(
      withInterceptors([
        authInterceptor,    // Asegúrate de que este interceptor se aplica para JWT
        errorInterceptor,   // Para manejo global de errores HTTP
        loadingInterceptor  // Para mostrar/ocultar un spinner de carga
      ])
    )
    // No necesitas importProvidersFrom(HttpClientModule) si usas provideHttpClient
  ]
};
