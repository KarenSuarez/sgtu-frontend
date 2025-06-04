import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectService } from '../../../features/subjects/services/subject.service'; 
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from '../../../core/models/subject.interface';
import { User } from '../../../core/models/user.interface';
import { Subscription } from 'rxjs';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-list-subject',
  standalone: true,
  imports: [
    CommonModule,
    CustomAlertComponent
  ],
  templateUrl: './list-subjects.component.html', 
  styleUrls: ['./list-subjects.component.css'] 
})
export class ListSubjectComponent implements OnInit, OnDestroy {
  subjects: Subject[] = [];
  currentUser: User | null = null;
  isAdmin: boolean = false;

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';

  private userSubscription: Subscription | undefined;
  private subjectsSubscription: Subscription | undefined;

  constructor(
    private subjectService: SubjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role?.name === 'admin' || false;
      this.loadSubjects(); 
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.subjectsSubscription?.unsubscribe();
  }

  loadSubjects(): void {
    if (!this.currentUser) {
      this.subjects = [];
      this.showAlert('info', 'Debe iniciar sesión para ver las asignaturas.');
      return;
    }

    if (this.isAdmin) {
      this.subjectsSubscription = this.subjectService.getAllSubjects().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.subjects = response.data;
            this.showAlert('success', 'Todas las asignaturas cargadas exitosamente (vista de administrador).');
          } else {
            this.showAlert('error', response.message || 'Error al cargar todas las asignaturas.');
            this.subjects = [];
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error de conexión al cargar todas las asignaturas: ' + (err.message || 'Error desconocido.'));
          console.error('Error al cargar todas las asignaturas:', err);
          this.subjects = [];
        }
      });
    } else {
      const userId = this.currentUser.id;
      this.subjectsSubscription = this.subjectService.getSubjectsForUser(userId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.subjects = response.data;
            this.showAlert('success', 'Tus asignaturas cargadas exitosamente.');
          } else {
            this.showAlert('error', response.message || 'Error al cargar tus asignaturas.');
            this.subjects = [];
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error de conexión al cargar tus asignaturas: ' + (err.message || 'Error desconocido.'));
          console.error('Error al cargar tus asignaturas:', err);
          this.subjects = [];
        }
      });
    }
  }

  createSubject(): void {
    this.showAlert('info', 'Funcionalidad de crear asignatura (admin) pendiente.');
    console.log('Navegar a crear asignatura');
  }

  editSubject(subjectId: number): void {
    this.showAlert('info', `Funcionalidad de editar asignatura (ID: ${subjectId}) pendiente.`);
    console.log('Navegar a editar asignatura con ID:', subjectId);
  }

  deleteSubject(subjectId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta asignatura?')) {
      this.subjectService.deleteSubject(subjectId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', response.message || 'Asignatura eliminada exitosamente.');
            this.loadSubjects();
          } else {
            this.showAlert('error', response.message || 'Error al eliminar asignatura.');
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error al eliminar asignatura: ' + (err.message || 'Error desconocido.'));
          console.error('Error al eliminar asignatura:', err);
        }
      });
    }
  }

  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.alertVisible = true;
    setTimeout(() => this.alertVisible = false, 5000);
  }
}
