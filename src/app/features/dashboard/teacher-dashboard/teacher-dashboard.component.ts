import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../subjects/services/subject.service';
import { TutoringService } from '../../tutoring/services/tutoring.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { User, Teacher } from '../../../core/models/user.interface';
import { Subject, ClassSchedule, AvailableSchedule } from '../../../core/models/subject.interface';
import { TutoringRequest, Tutoring, TutoringStatus, RequestStatus } from '../../../core/models/tutoring.interface';
import { ListSubjectComponent } from '../../subjects/list-subjects/list-subjects.component';
import { TeacherAvailabilityScheduleComponent } from '../../schedules/teacher-availability-schedule/teacher-availability-schedule.component';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';


import { ApproveTutoringComponent } from '../../tutoring/approve-tutoring/approve-tutoring.component';
import { ListTutoringComponent } from '../../tutoring/list-tutoring/list-tutoring.component'; 
 // Para el docente
// Importar otros componentes que vayas a cargar aquí (ListSubjectComponent, etc.)
// import { ListSubjectComponent } from '../../asignaturas/list-subject/list-subject.component';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, ApproveTutoringComponent, ListSubjectComponent, TeacherAvailabilityScheduleComponent, ListTutoringComponent], // Añadir DatePipe y ApproveTutoringComponent
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userName: string = 'Docente';

  pendingTutoringRequestsCount: number = 0;
  upcomingTutorings: Tutoring[] = [];
  subjectsTaught: Subject[] = [];

  isSidebarCollapsed = false;
  isUserMenuOpen = false;

  currentView: 'inicio' | 'asignaturas' | 'horario' | 'tutorias-solicitudes' | 'tutorias-agendadas' | 'logs' = 'inicio'; // Define los tipos de vista

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
      this.user = user;
      if (user) {
        this.userName = user.name || 'Docente';
        if (user.role?.name === 'teacher' && user.professor) {
            this.loadDashboardData(user.id);
        } else {
            console.warn('Usuario logueado no es profesor o perfil de profesor incompleto para TeacherDashboard. Redirigiendo a login...');
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

   private loadDashboardData(teacherId: number): void {
    const professorId = this.user?.professor?.id;
    if (!professorId) {
      this.pendingTutoringRequestsCount = 0;
      this.upcomingTutorings = [];
      this.subjectsTaught = [];
      return;
    }

    this.dataSubscription = forkJoin([
      this.tutoringService.getTutoringRequests({ teacherId: professorId, status: RequestStatus.PENDING }),
      this.tutoringService.getTutorings({ teacherId: professorId, status: TutoringStatus.SCHEDULED }),
      this.subjectService.getSubjectsForUser(teacherId)
    ]).subscribe({
      next: ([pendingRequests, upcomingTutorings, subjectsTaught]) => {
        this.pendingTutoringRequestsCount = pendingRequests.data?.length || 0;
        const now = new Date();
        this.upcomingTutorings = upcomingTutorings.data
          ? upcomingTutorings.data
              .filter(t => new Date(t.startDate) > now)
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
          : [];

        this.subjectsTaught = subjectsTaught.data || [];
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard del docente:', err);
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
