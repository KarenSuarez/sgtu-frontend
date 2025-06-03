import { Routes } from '@angular/router';
import { RequestTutoringComponent } from './request-tutoring/request-tutoring.component';
import { ApproveTutoringComponent } from './approve-tutoring/approve-tutoring.component';


export const TUTORING_ROUTES: Routes = [
  { path: 'request', component: RequestTutoringComponent },
  { path: 'approve', component: ApproveTutoringComponent },
  { path: '', redirectTo: 'request', pathMatch: 'full' } 
];
