import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    children: [
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'docente',
        loadComponent: () =>
          import('./features/dashboard/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
      },
      {
        path: 'estudiante',
        loadComponent: () =>
          import('./features/dashboard/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
