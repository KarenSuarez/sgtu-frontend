import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TutoringService } from '../../../features/tutoring/services/tutoring.service';
import { User, StudentProfile, TeacherProfile } from '../../../core/models/user.interface';
import { Tutoring, TutoringRequest, TutoringStatus, RequestStatus } from '../../../core/models/tutoring.interface';
import { Subscription, Observable } from 'rxjs'; 
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-list-tutoring',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent, DatePipe],
  templateUrl: './list-tutoring.component.html',
  styleUrls: ['./list-tutoring.component.css']
})
export class ListTutoringComponent implements OnInit, OnDestroy {
  @Input() listType: 'tutorings' | 'requests' = 'tutorings'; 
  @Input() selectedStatus: TutoringStatus | RequestStatus | string | null = null;

  currentUser: User | null = null;
  profileId: number | null = null; 

  displayData: (Tutoring | TutoringRequest)[] = []; 
  currentStatuses: (TutoringStatus | RequestStatus)[] = []; 

  TutoringStatus = TutoringStatus;
  RequestStatus = RequestStatus;

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';

  private userSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private tutoringService: TutoringService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (this.forRole === 'teacher' && user.role?.name === 'teacher' && user.professor) {
          this.profileId = user.professor.id;
        } else if (this.forRole === 'student' && user.role?.name === 'student' && user.student) {
          this.profileId = user.student.id;
        } else {
          this.showAlert('warning', `Acceso denegado. Este listado es para ${this.forRole}s.`);
          this.displayData = [];
          return; 
        }

        this.currentStatuses = Object.values(this.listType === 'tutorings' ? TutoringStatus : RequestStatus);
        this.loadData(); 
      } else {
;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  loadData(): void {
    if (!this.profileId) {
      console.warn(`No hay ID de perfil para cargar ${this.listType}.`);
      this.displayData = [];
      return;
    }

    let dataObservable: Observable<any>;

    if (this.listType === 'tutorings') {
      const filters: { studentId?: number; teacherId?: number; status?: TutoringStatus } = {};
      if (this.forRole === 'teacher') {
        filters.teacherId = this.profileId;
      } else if (this.forRole === 'student') {
        filters.studentId = this.profileId;
      }
      if (
        this.selectedStatus &&
        Object.values(TutoringStatus).includes(this.selectedStatus as TutoringStatus)
      ) {
        filters.status = this.selectedStatus as TutoringStatus;
      }
      dataObservable = this.tutoringService.getTutorings(filters);
    } else {
      // Filtro solo con RequestStatus
      const filters: { studentId?: number; teacherId?: number; status?: RequestStatus } = {};
      if (this.forRole === 'teacher') {
        filters.teacherId = this.profileId;
      } else if (this.forRole === 'student') {
        filters.studentId = this.profileId;
      }
      if (
        this.selectedStatus &&
        Object.values(RequestStatus).includes(this.selectedStatus as RequestStatus)
      ) {
        filters.status = this.selectedStatus as RequestStatus;
      }
      dataObservable = this.tutoringService.getTutoringRequests(filters);
    }

    this.dataSubscription = dataObservable.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.displayData = response.data;
          this.showAlert('success', `${this.listType === 'tutorings' ? 'Tutorías' : 'Solicitudes'} cargadas exitosamente.`);
        } else {
          this.showAlert('error', response.message || `Error al cargar ${this.listType}.`);
          this.displayData = [];
        }
      },
      error: (err) => {
        this.showAlert('error', `Error al cargar ${this.listType}: ` + (err.message || 'Error desconocido.'));
        this.displayData = [];
      }
    });
  }

  isTutoring(item: Tutoring | TutoringRequest): item is Tutoring {
    return (item as Tutoring).startDate !== undefined;
  }

  isTutoringRequest(item: Tutoring | TutoringRequest): item is TutoringRequest {
    return (item as TutoringRequest).requestDate !== undefined;
  }

  /**
   * Determina si una tutoría agendada puede ser Completada/No Asistió/Cancelada.
   * @param tutoring 
   * @returns 
   */
  canPerformTutoringAction(tutoring: Tutoring): boolean {
    return tutoring.status === TutoringStatus.SCHEDULED || tutoring.status === TutoringStatus.IN_PROGRESS;
  }

  cancelTutoring(id: number): void {
    if (this.listType !== 'tutorings') return; 
    if (confirm('¿Estás seguro de que quieres cancelar esta tutoría?')) {
      this.tutoringService.cancelTutoring(id, { reason: 'Cancelado por el usuario' }).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', response.message || 'Tutoría cancelada exitosamente.');
            this.loadData(); 
          } else {
            this.showAlert('error', response.message || 'Error al cancelar tutoría.');
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error al cancelar tutoría: ' + (err.message || 'Error desconocido.'));
          console.error('Error al cancelar tutoría:', err);
        }
      });
    }
  }

  markTutoringSession(id: number, status: TutoringStatus.COMPLETED | TutoringStatus.NO_SHOW): void {
    if (this.listType !== 'tutorings') return; 
    if (confirm(`¿Marcar tutoría como ${status === TutoringStatus.COMPLETED ? 'COMPLETADA' : 'NO ASISTIÓ'}?`)) {
      this.tutoringService.markTutoringSession(id, { status: status, observations: 'Marcada por el usuario' }).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', response.message || `Tutoría marcada como ${status.toLowerCase()} exitosamente.`);
            this.loadData(); 
          } else {
            this.showAlert('error', response.message || `Error al marcar tutoría como ${status.toLowerCase()}.`);
          }
        },
        error: (err) => {
          this.showAlert('error', `Error al marcar tutoría como ${status.toLowerCase()}: ` + (err.message || 'Error desconocido.'));
          console.error(`Error al marcar tutoría como ${status.toLowerCase()}:`, err);
        }
      });
    }
  }

  processRequest(id: number, status: 'APPROVED' | 'REJECTED' | 'CANCELLED', rejectionReason: string = ''): void {
    if (this.listType !== 'requests') return; // Asegurarse de que sea una solicitud

    if (status === 'CANCELLED' && confirm(`¿Estás seguro de que quieres cancelar esta solicitud?`)) {
      const processData: { status: 'APPROVED' | 'REJECTED' | 'CANCELLED'; rejectionReason: string } = {
        status: status,
        rejectionReason: rejectionReason || 'Cancelada por el estudiante'
      };
      this.tutoringService.processTutoringRequest(id, processData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', `Solicitud ${status.toLowerCase()} exitosamente.`);
            this.loadData();
          } else {
            this.showAlert('error', response.message || `Error al procesar la solicitud.`);
          }
        },
        error: (err) => {
          this.showAlert('error', `Error al procesar solicitud: ${err.message || 'Error desconocido.'}`);
          console.error(`Error procesando solicitud ${status}:`, err);
        }
      });
    } else if (status === 'REJECTED' && !rejectionReason.trim()) {

        this.showAlert('warning', 'Debe proporcionar una razón para rechazar la solicitud.');
    }
  }

  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.alertVisible = true;
    setTimeout(() => this.alertVisible = false, 5000);
  }
}
