// src/app/features/tutoring/approve-tutoring/approve-tutoring.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TutoringService } from '../../../features/tutoring/services/tutoring.service';
import {
  User, TeacherProfile // Importar TeacherProfile
} from '../../../core/models/user.interface';
import {
  TutoringRequest, RequestStatus, ProcessTutoringRequest
} from '../../../core/models/tutoring.interface';
import { Subscription } from 'rxjs';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-approve-tutoring',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent, DatePipe],
  templateUrl: './approve-tutoring.component.html',
  styleUrls: ['./approve-tutoring.component.css']
})
export class ApproveTutoringComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  teacherProfileId: number | null = null; // ID del perfil de profesor (Professor.id)
  pendingRequests: TutoringRequest[] = [];
  selectedRequest: TutoringRequest | null = null;
  rejectionReason: string = '';

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';

  private userSubscription: Subscription | undefined;
  private requestsSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private tutoringService: TutoringService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role?.name === 'teacher' && user.professor) {
        // Asigna el ID del perfil de profesor (Professor.id)
        this.teacherProfileId = user.professor.id; // ¡Esto es clave para filtrar solicitudes!
        this.loadPendingRequests(); // Cargar solicitudes una vez que tenemos el ID del profesor
      } else {
        // Redirigir o mostrar mensaje si no es profesor
        console.warn('Acceso denegado. Solo docentes pueden aprobar tutorías.');
        this.showAlert('warning', 'Acceso denegado. Solo docentes pueden gestionar sus solicitudes.');
        this.pendingRequests = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.requestsSubscription?.unsubscribe();
  }

  loadPendingRequests(): void {
    if (!this.teacherProfileId) {
      console.warn("No hay ID de profesor para cargar solicitudes pendientes.");
      this.pendingRequests = [];
      return;
    }

    this.requestsSubscription = this.tutoringService.getTutoringRequests({
      teacherId: this.teacherProfileId, // Filtra por el ID del perfil de profesor
      status: RequestStatus.PENDING
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pendingRequests = response.data;
          this.showAlert('success', 'Solicitudes pendientes cargadas exitosamente.');
          console.log("Solicitudes pendientes cargadas:", this.pendingRequests); // DEBUG
        } else {
          this.showAlert('error', response.message || 'Error al cargar solicitudes pendientes.');
          this.pendingRequests = [];
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error al cargar solicitudes pendientes: ' + (err.message || 'Error desconocido.'));
        console.error('Error al cargar solicitudes pendientes:', err);
        this.pendingRequests = [];
      }
    });
  }

  selectRequest(request: TutoringRequest): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.alertVisible = false;
  }

  processRequest(status: 'APPROVED' | 'REJECTED' | 'CANCELLED'): void {
    if (!this.selectedRequest) {
      this.showAlert('warning', 'Debe seleccionar una solicitud primero.');
      return;
    }

    if (status === 'REJECTED' && !this.rejectionReason.trim()) {
      this.showAlert('warning', 'Debe proporcionar una razón para rechazar la solicitud.');
      return;
    }

    const processData: ProcessTutoringRequest = {
      status: status,
      rejectionReason: status === 'REJECTED' ? this.rejectionReason : undefined
    };

    this.tutoringService.processTutoringRequest(this.selectedRequest.id, processData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.showAlert('success', `Solicitud ${status.toLowerCase()} exitosamente.`);
          this.selectedRequest = null;
          this.loadPendingRequests(); // Recargar la lista después de procesar
        } else {
          this.showAlert('error', response.message || `Error al ${status.toLowerCase()} la solicitud.`);
        }
      },
      error: (err) => {
        this.showAlert('error', `Error al procesar solicitud: ${err.message || 'Error desconocido.'}`);
        console.error(`Error procesando solicitud ${status}:`, err);
      }
    });
  }

  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.alertVisible = true;
    setTimeout(() => this.alertVisible = false, 5000);
  }
}
