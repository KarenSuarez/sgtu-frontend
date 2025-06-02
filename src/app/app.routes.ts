import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { TeacherDashboardComponent } from './features/dashboard/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './features/dashboard/student-dashboard/student-dashboard.component';
import { LogsDashboardComponent } from './features/dashboard/logs-dashboard/logs-dashboard.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'teacher',
    component: TeacherDashboardComponent
  },
  { path: 'student',
    component: StudentDashboardComponent
  },
  {
    path: 'logs',
    component: LogsDashboardComponent
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
