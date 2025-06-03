import { Routes } from '@angular/router';
import { RequestTutoringComponent } from './request-tutoring/request-tutoring.component';
import { ApproveTutoringComponent } from './approve-tutoring/approve-tutoring.component';
// Importa los otros componentes de tutoring que ya tienes definidos en la estructura
// import { ListTutoringComponent } from './list-tutoring/list-tutoring.component';
// import { HistoryComponent } from './history/history.component';

export const TUTORING_ROUTES: Routes = [
  { path: 'request', component: RequestTutoringComponent },
  { path: 'approve', component: ApproveTutoringComponent },
  // { path: 'list', component: ListTutoringComponent },
  // { path: 'history', component: HistoryComponent },
  { path: '', redirectTo: 'request', pathMatch: 'full' } // Ruta por defecto para /tutorings
];
