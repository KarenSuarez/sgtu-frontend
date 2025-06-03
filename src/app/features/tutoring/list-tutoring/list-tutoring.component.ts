// src/app/features/tutoring/list-tutoring/list-tutoring.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TutoringService } from '../../../features/tutoring/services/tutoring.service';
import { User, StudentProfile, TeacherProfile } from '../../../core/models/user.interface';
import { Tutoring, TutoringRequest, TutoringStatus, RequestStatus } from '../../../core/models/tutoring.interface';
import { Subscription, Observable } from 'rxjs'; // Importar Observable
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-list-tutoring',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent, DatePipe],
  templateUrl: './list-tutoring.component.html',
  styleUrls: ['./list-tutoring.component.css']
})
export class ListTutoringComponent implements OnInit, OnDestroy {
  @Input() listType: 'tutorings' | 'requests' = 'tutorings'; // 'tutorings' para tutorías agendadas/historial, 'requests' para solicitudes pendientes
  @Input() forRole: 'student' | 'teacher' = 'teacher'; // Indica si es para un estudiante o un docente
  @Input() selectedStatus: TutoringStatus | RequestStatus | string | null = null;

  currentUser: User | null = null;
  profileId: number | null = null; // ID del perfil (StudentProfile.id o TeacherProfile.id)

  displayData: (Tutoring | TutoringRequest)[] = []; // Datos que se muestran en la tabla
  currentStatuses: (TutoringStatus | RequestStatus)[] = []; // Los estados posibles para el selector de filtro

  // Exponer los enums al template para usar en ngIf/ngClass
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
        // Asignar el ID de perfil correcto según el rol y tipo de usuario
        if (this.forRole === 'teacher' && user.role?.name === 'teacher' && user.professor) {
          this.profileId = user.professor.id;
        } else if (this.forRole === 'student' && user.role?.name === 'student' && user.student) {
          this.profileId = user.student.id;
        } else {
          // Si el rol no coincide o el perfil está incompleto para el tipo de listado
          this.showAlert('warning', `Acceso denegado. Este listado es para ${this.forRole}s.`);
          this.displayData = [];
          return; // Salir si no hay perfil válido
        }

        // Configurar los estados disponibles para el filtro
        this.currentStatuses = Object.values(this.listType === 'tutorings' ? TutoringStatus : RequestStatus);
        this.loadData(); // Cargar datos una vez que tenemos el profileId
      } else {
        // Los guards de ruta deberían manejar esto, pero es una precaución.
        // this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  /**
   * Carga los datos (tutorías o solicitudes) desde el backend.
   */
  loadData(): void {
    if (!this.profileId) {
      console.warn(`No hay ID de perfil para cargar ${this.listType}.`);
      this.displayData = [];
      return;
    }

    let dataObservable: Observable<any>;

    if (this.listType === 'tutorings') {
      // Filtro solo con TutoringStatus
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

  // --- Type Guards para diferenciar entre Tutoring y TutoringRequest en el HTML ---
  isTutoring(item: Tutoring | TutoringRequest): item is Tutoring {
    return (item as Tutoring).startDate !== undefined;
  }

  isTutoringRequest(item: Tutoring | TutoringRequest): item is TutoringRequest {
    return (item as TutoringRequest).requestDate !== undefined;
  }

  /**
   * Determina si una tutoría agendada puede ser Completada/No Asistió/Cancelada.
   * @param tutoring Una tutoría agendada.
   * @returns true si está en estado SCHEDULED o IN_PROGRESS.
   */
  canPerformTutoringAction(tutoring: Tutoring): boolean {
    return tutoring.status === TutoringStatus.SCHEDULED || tutoring.status === TutoringStatus.IN_PROGRESS;
  }

  // --- Métodos de Acción para Tutorías (Solo si listType === 'tutorings') ---
  cancelTutoring(id: number): void {
    if (this.listType !== 'tutorings') return; // Asegurarse de que sea una tutoría agendada
    if (confirm('¿Estás seguro de que quieres cancelar esta tutoría?')) {
      // Puedes añadir un modal para pedir la razón de cancelación
      this.tutoringService.cancelTutoring(id, { reason: 'Cancelado por el usuario' }).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', response.message || 'Tutoría cancelada exitosamente.');
            this.loadData(); // Recargar lista
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
    if (this.listType !== 'tutorings') return; // Asegurarse de que sea una tutoría agendada
    if (confirm(`¿Marcar tutoría como ${status === TutoringStatus.COMPLETED ? 'COMPLETADA' : 'NO ASISTIÓ'}?`)) {
      // Puedes añadir un modal para observaciones
      this.tutoringService.markTutoringSession(id, { status: status, observations: 'Marcada por el usuario' }).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', response.message || `Tutoría marcada como ${status.toLowerCase()} exitosamente.`);
            this.loadData(); // Recargar lista
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

  // --- Métodos de Acción para Solicitudes (Solo si listType === 'requests') ---
  processRequest(id: number, status: 'APPROVED' | 'REJECTED' | 'CANCELLED', rejectionReason: string = ''): void {
    if (this.listType !== 'requests') return; // Asegurarse de que sea una solicitud
    // Esta función debería ser llamada solo por el estudiante para CANCELAR su solicitud PENDIENTE
    // La aprobación/rechazo del docente se hace en approve-tutoring.component

    if (status === 'CANCELLED' && confirm(`¿Estás seguro de que quieres cancelar esta solicitud?`)) {
      // Para estudiantes que cancelan su propia solicitud
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
        // En este componente, el docente no debería "rechazar" aquí, sino en ApproveTutoringComponent.
        // Esto es un safety net.
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
