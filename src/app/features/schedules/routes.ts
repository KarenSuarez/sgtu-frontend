// src/app/features/schedules/routes.ts
import { Routes } from '@angular/router';
import { StudentClassScheduleComponent } from './student-class-schedule/student-class-schedule.component';
import { TeacherAvailabilityScheduleComponent } from './teacher-availability-schedule/teacher-availability-schedule.component';

export const SCHEDULES_ROUTES: Routes = [
  { path: 'class', component: StudentClassScheduleComponent },
  { path: 'availability', component: TeacherAvailabilityScheduleComponent },
  { path: '', redirectTo: 'class', pathMatch: 'full' }
];
