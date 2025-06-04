import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { TeacherDashboardComponent } from './features/dashboard/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './features/dashboard/student-dashboard/student-dashboard.component';
import { LogsDashboardComponent } from './features/dashboard/logs-dashboard/logs-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },

  { path: 'dashboard/teacher', component: TeacherDashboardComponent },
  { path: 'dashboard/student', component: StudentDashboardComponent },
  { path: 'dashboard/admin', component: LogsDashboardComponent }, 

  { path: '**', redirectTo: 'auth/login' },
];
