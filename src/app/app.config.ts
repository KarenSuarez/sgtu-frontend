import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; 
import { errorInterceptor } from './core/interceptors/error.interceptor'; 
import { loadingInterceptor } from './core/interceptors/loading.interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,    
        errorInterceptor,   
        loadingInterceptor  
      ])
    )
  ]
};
