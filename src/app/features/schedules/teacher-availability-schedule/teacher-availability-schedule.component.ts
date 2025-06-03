import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { User, TeacherProfile } from '../../../core/models/user.interface';
import { AvailableSchedule, DayOfWeek, CreateAvailableScheduleRequest, ClassSchedule, UpdateAvailableScheduleRequest } from '../../../core/models/subject.interface'; // Ensure UpdateAvailableScheduleRequest is imported
import { Subscription, forkJoin } from 'rxjs';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

interface SlotInfo {
  type: 'class' | 'available' | 'occupied' | 'empty';
  classData?: ClassSchedule;
  availableData?: AvailableSchedule;
}

@Component({
  selector: 'app-teacher-availability-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent, DatePipe, ModalComponent],
  templateUrl: './teacher-availability-schedule.component.html',
  styleUrls: ['./teacher-availability-schedule.component.css']
})
export class TeacherAvailabilityScheduleComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  teacherProfileId: number | null = null;
  userName: string = '';

  hours: string[] = Array.from({ length: 11 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00:00`;
  });
  days: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY];

  dayOfWeekToIndex: { [key in DayOfWeek]: number } = {
    [DayOfWeek.SUNDAY]: 0,
    [DayOfWeek.MONDAY]: 1,
    [DayOfWeek.TUESDAY]: 2,
    [DayOfWeek.WEDNESDAY]: 3,
    [DayOfWeek.THURSDAY]: 4,
    [DayOfWeek.FRIDAY]: 5,
    [DayOfWeek.SATURDAY]: 6,
  };
  currentWeekDays: { name: DayOfWeek, date: string }[] = []; 

  availabilitySchedules: AvailableSchedule[] = [];
  classSchedules: ClassSchedule[] = [];

  showFormModal = false;
  newAvailability: CreateAvailableScheduleRequest = {
    teacherId: 0,
    startTime: '',
    endTime: '',
    dayOfWeek: undefined,
    specificDate: undefined,
    available: true
  };
  isEditing: boolean = false;
  editingScheduleId: number | null = null;

  daysOfWeek: DayOfWeek[] = Object.values(DayOfWeek); 

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';

  private userSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.generateCurrentWeekDays(); 
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userName = user.name || 'Docente';
        if (user.role?.name === 'teacher' && user.professor) {
            this.teacherProfileId = user.professor.id;
            this.newAvailability.teacherId = this.teacherProfileId;
            this.loadAllScheduleData();
        } else {
            this.showAlert('warning', 'Acceso denegado. Solo docentes pueden gestionar su disponibilidad.');
            this.availabilitySchedules = [];
            this.classSchedules = [];
        }
      } else {
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  generateCurrentWeekDays(): void {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    this.currentWeekDays = [];
    for (let i = 0; i < this.days.length; i++) { 
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);

      this.currentWeekDays.push({
        name: this.days[i], 
        date: currentDay.toISOString().split('T')[0] 
      });
    }
  }

  loadAllScheduleData(): void {
    if (!this.teacherProfileId) return;

    this.dataSubscription = forkJoin([
      this.scheduleService.getAvailabilitySchedulesForTeacher(this.teacherProfileId),
      this.scheduleService.getClassSchedulesForUser(this.currentUser!.id)
    ]).subscribe({
      next: ([availabilityRes, classRes]) => {
        if (availabilityRes.success && availabilityRes.data) {
          this.availabilitySchedules = availabilityRes.data.map(schedule => ({
            ...schedule,
            specificDate: schedule.specificDate ? new Date(schedule.specificDate).toISOString().split('T')[0] : null
          }));
          this.showAlert('success', 'Horarios de disponibilidad cargados.');
        } else {
          this.showAlert('error', availabilityRes.message || 'Error al cargar disponibilidad.');
          this.availabilitySchedules = [];
        }

        if (classRes.success && classRes.data) {
          this.classSchedules = classRes.data;
          this.showAlert('success', 'Horarios de clase cargados.');
        } else {
          this.showAlert('error', classRes.message || 'Error al cargar horarios de clase.');
          this.classSchedules = [];
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error de conexión al cargar horarios: ' + (err.message || 'Error desconocido.'));
        console.error('Error al cargar horarios:', err);
        this.availabilitySchedules = [];
        this.classSchedules = [];
      }
    });
  }

  /**
   * Determina el tipo de slot para el calendario, incluyendo fechas específicas.
   * @param hour 
   * @param dayEnum 
   * @param dateStringToday 
   * @returns 
   */
  getSlotType(hour: string, dayEnum: DayOfWeek, dateStringToday: string): SlotInfo { 
    const [h, m] = hour.split(':').map(Number);
    const slotStartMinutes = h * 60 + m;

    const matchingClass = this.classSchedules.find(schedule => {
      const classStartMinutes = this.timeToMinutes(schedule.startTime);
      const classEndMinutes = this.timeToMinutes(schedule.endTime);
      return schedule.dayOfWeek === dayEnum && slotStartMinutes >= classStartMinutes && slotStartMinutes < classEndMinutes;
    });

    if (matchingClass) {
      return { type: 'class', classData: matchingClass };
    }

    const matchingAvailability = this.availabilitySchedules.find(schedule => {
      const availStartMinutes = this.timeToMinutes(schedule.startTime);
      const availEndMinutes = this.timeToMinutes(schedule.endTime);

      const isTimeMatch = slotStartMinutes >= availStartMinutes && slotStartMinutes < availEndMinutes;

      const isRecurringDayMatch = schedule.dayOfWeek === dayEnum && schedule.specificDate === null;

      const isSpecificDateMatch = schedule.specificDate === dateStringToday && schedule.dayOfWeek === null;

      return (isRecurringDayMatch || isSpecificDateMatch) && isTimeMatch;
    });

    if (matchingAvailability) {
      return { type: matchingAvailability.available ? 'available' : 'occupied', availableData: matchingAvailability };
    }

    return { type: 'empty' };
  }
  openAddAvailabilityModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  openEditAvailabilityModal(schedule: AvailableSchedule): void {
    this.isEditing = true;
    this.editingScheduleId = schedule.id;
    this.newAvailability = {
      ...schedule,
      dayOfWeek: schedule.dayOfWeek !== null ? schedule.dayOfWeek : undefined,
      specificDate: schedule.specificDate ? new Date(schedule.specificDate).toISOString().split('T')[0] : undefined,
    };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  addOrUpdateAvailability(): void {
    if (!this.newAvailability.startTime || !this.newAvailability.endTime || (!this.newAvailability.dayOfWeek && !this.newAvailability.specificDate)) {
      this.showAlert('warning', 'Por favor, complete al menos la hora de inicio, fin y un día/fecha.');
      return;
    }
    if (this.newAvailability.dayOfWeek && this.newAvailability.specificDate) {
      this.showAlert('warning', 'No se puede seleccionar un día de la semana y una fecha específica al mismo tiempo.');
      return;
    }
    if (!this.newAvailability.dayOfWeek && !this.newAvailability.specificDate) {
        this.showAlert('warning', 'Debe seleccionar un día de la semana o una fecha específica.');
        return;
    }
    if (!this.newAvailability.teacherId) {
      this.showAlert('error', 'ID del docente no disponible.');
      return;
    }

    const dataToSend: CreateAvailableScheduleRequest = { ...this.newAvailability };

    if (dataToSend.dayOfWeek === null) {
      dataToSend.dayOfWeek = undefined;
    }
    if (dataToSend.specificDate === null || dataToSend.specificDate === '') {
      dataToSend.specificDate = undefined;
    }

    if (this.isEditing && this.editingScheduleId) {
      const updateData: UpdateAvailableScheduleRequest = dataToSend;
      this.scheduleService.updateAvailabilitySchedule(this.editingScheduleId, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', 'Horario de disponibilidad actualizado exitosamente.');
            this.closeFormModal();
            this.loadAllScheduleData(); 
          } else {
            this.showAlert('error', response.message || 'Error al actualizar horario.');
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error al actualizar horario: ' + (err.message || 'Error desconocido.'));
          console.error('Error al actualizar horario:', err);
        }
      });
    } else {
      this.scheduleService.createAvailabilitySchedule(dataToSend).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', 'Horario de disponibilidad añadido exitosamente.');
            this.closeFormModal();
            this.loadAllScheduleData(); 
          } else {
            this.showAlert('error', response.message || 'Error al añadir horario.');
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error al añadir horario: ' + (err.message || 'Error desconocido.'));
          console.error('Error al añadir horario:', err);
        }
      });
    }
  }

  deleteAvailability(scheduleId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este horario de disponibilidad?')) {
      this.scheduleService.deleteAvailabilitySchedule(scheduleId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('success', response.message || 'Horario de disponibilidad eliminado exitosamente.');
            this.loadAllScheduleData(); 
          } else {
            this.showAlert('error', response.message || 'Error al eliminar horario.');
          }
        },
        error: (err) => {
          this.showAlert('error', 'Error al eliminar horario: ' + (err.message || 'Error desconocido.'));
          console.error('Error al eliminar horario:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingScheduleId = null;
    this.newAvailability = {
      teacherId: this.teacherProfileId || 0,
      startTime: '',
      endTime: '',
      dayOfWeek: undefined,
      specificDate: undefined,
      available: true
    };
    this.alertVisible = false;
  }

  onDayOfWeekChange(): void {
    if (this.newAvailability.dayOfWeek) {
      this.newAvailability.specificDate = undefined;
    } else {
    }
  }

  onSpecificDateChange(): void {
    if (this.newAvailability.specificDate) {
      this.newAvailability.dayOfWeek = undefined;
    } else {
    }
  }

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
