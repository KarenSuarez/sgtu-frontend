// src/app/features/dashboard/student-dashboard/student-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Importar servicios y modelos
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../subjects/services/subject.service';
import { TutoringService } from '../../tutoring/services/tutoring.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { User, StudentProfile } from '../../../core/models/user.interface';
import { Subject, ClassSchedule } from '../../../core/models/subject.interface';
import { TutoringRequest, Tutoring, TutoringStatus, RequestStatus } from '../../../core/models/tutoring.interface';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Importar los componentes que cargarás dinámicamente
import { RequestTutoringComponent } from '../../tutoring/request-tutoring/request-tutoring.component';
import { StudentClassScheduleComponent } from '../../schedules/student-class-schedule/student-class-schedule.component';
import { ListSubjectComponent } from '../../subjects/list-subjects/list-subjects.component'; // Asegúrate de la ruta correcta
import { ListTutoringComponent } from '../../tutoring/list-tutoring/list-tutoring.component'; // ¡NUEVO!

@Component({
  selector: 'app-estudiante',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, RequestTutoringComponent, StudentClassScheduleComponent, ListSubjectComponent, ListTutoringComponent], // Añadir ListTutoringComponent
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  studentProfileId: number | null = null;
  userName: string = 'Estudiante';

  // Resumen del dashboard (datos del backend)
  upcomingTutorings: Tutoring[] = [];
  pendingTutoringRequests: TutoringRequest[] = [];
  subjectsEnrolled: Subject[] = [];

  isSidebarCollapsed = false;
  isUserMenuOpen = false;

  currentView: 'inicio' | 'asignaturas' | 'horario' | 'tutorias-solicitud' | 'tutorias-mis-solicitudes' | 'tutorias-historial' = 'inicio';

  private userSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;

  constructor(
    public router: Router,
    private authService: AuthService,
    private subjectService: SubjectService,
    private tutoringService: TutoringService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userName = user.name || 'Estudiante';
        if (user.role?.name === 'student' && user.student) {
            this.studentProfileId = user.student.id;
            this.loadDashboardData(this.studentProfileId); // Cargar datos del dashboard si es estudiante
        } else {
            console.warn('Usuario logueado no es estudiante o perfil de estudiante incompleto para StudentDashboard. Redirigiendo a login...');
            this.router.navigate(['/auth/login']);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  private loadDashboardData(studentId: number): void {
    this.dataSubscription = forkJoin([
      this.tutoringService.getTutorings({ studentId: studentId, status: TutoringStatus.SCHEDULED }),
      this.tutoringService.getTutoringRequests({ studentId: studentId, status: RequestStatus.PENDING }),
      this.subjectService.getSubjectsForUser(this.currentUser!.id)
    ]).subscribe({
      next: ([upcomingTutorings, pendingRequests, subjectsEnrolled]) => {
        const now = new Date();
        this.upcomingTutorings = upcomingTutorings.data
          ? upcomingTutorings.data
              .filter(t => new Date(t.startDate) > now)
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
          : [];

        this.pendingTutoringRequests = pendingRequests.data || [];
        this.subjectsEnrolled = subjectsEnrolled.data || [];
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard del estudiante:', err);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout();
  }

  navigateTo(view: typeof this.currentView): void {
    this.currentView = view;
  }
}
