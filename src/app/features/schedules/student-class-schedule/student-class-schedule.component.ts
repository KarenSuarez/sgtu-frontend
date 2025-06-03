import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { User, StudentProfile } from '../../../core/models/user.interface';
import { ClassSchedule, DayOfWeek } from '../../../core/models/subject.interface';
import { Subscription } from 'rxjs';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

interface SlotInfo {
  type: 'class' | 'empty'; 
  classData?: ClassSchedule;
}

@Component({
  selector: 'app-student-class-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent],
  templateUrl: './student-class-schedule.component.html',
  styleUrls: ['./student-class-schedule.component.css']
})
export class StudentClassScheduleComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  studentProfileId: number | null = null;
  classSchedules: ClassSchedule[] = [];

  hours: string[] = Array.from({ length: 11 }, (_, i) => `${7 + i}:00`); 
  days: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY]; // Días de la semana

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';

  private userSubscription: Subscription | undefined;
  private scheduleSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role?.name === 'student' && user.student) {
        this.studentProfileId = user.student.userId;
        this.loadClassSchedules();
      } else {
        this.showAlert('warning', 'Acceso denegado. Solo estudiantes pueden ver su horario de clases.');
        this.classSchedules = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.scheduleSubscription?.unsubscribe();
  }

  loadClassSchedules(): void {
    if (!this.studentProfileId) return;

    this.scheduleSubscription = this.scheduleService.getClassSchedulesForUser(this.studentProfileId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.classSchedules = response.data;
          this.showAlert('success', 'Horario de clases cargado exitosamente.');
        } else {
          this.showAlert('error', response.message || 'Error al cargar horario de clases.');
          this.classSchedules = [];
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error de conexión al cargar horario de clases: ' + (err.message || 'Error desconocido.'));
        console.error('Error al cargar horario de clases:', err);
        this.classSchedules = [];
      }
    });
  }

  /**
   * Determina el tipo de slot para el calendario del estudiante (Clase o Vacío).
   * @param hour .
   * @param day 
   * @returns 
   */
  getSlotType(hour: string, day: DayOfWeek): SlotInfo {
    const [h, m] = hour.split(':').map(Number);
    const slotStartMinutes = h * 60 + m;

    const matchingClass = this.classSchedules.find(schedule => {
      const classStartMinutes = this.timeToMinutes(schedule.startTime);
      const classEndMinutes = this.timeToMinutes(schedule.endTime);
      return schedule.dayOfWeek === day && slotStartMinutes >= classStartMinutes && slotStartMinutes < classEndMinutes;
    });

    if (matchingClass) {
      return { type: 'class', classData: matchingClass };
    }

    return { type: 'empty' };
  }

  /**
   * Convierte una cadena de tiempo (HH:MM:SS) a minutos desde la medianoche.
   * @param timeString 
   * @returns 
   */
  private timeToMinutes(timeString: string): number {
    const [h, m] = timeString.split(':').map(Number);
    return h * 60 + m;
  }

  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.alertVisible = true;
    setTimeout(() => this.alertVisible = false, 5000);
  }
}
