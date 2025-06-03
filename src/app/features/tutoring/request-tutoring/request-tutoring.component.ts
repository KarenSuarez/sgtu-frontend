// src/app/features/tutoring/request-tutoring/request-tutoring.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Asegúrate de importar DatePipe
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../subjects/services/subject.service';
import { UserService } from '../../../core/services/user.service';
import { TutoringService } from '../../..//features/tutoring/services/tutoring.service';
import { ScheduleService } from '../../../core/services/schedule.service'; // Asegúrate de la ruta correcta
import { User, StudentProfile, TeacherProfile } from '../../../core/models/user.interface';
import { Subject, AvailableSchedule, DayOfWeek } from '../../../core/models/subject.interface';
import { CreateTutoringRequest } from '../../../core/models/tutoring.interface';
import { Subscription, forkJoin } from 'rxjs';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-request-tutoring',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent],
  templateUrl: './request-tutoring.component.html',
  styleUrls: ['./request-tutoring.component.css']
})
export class RequestTutoringComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  studentProfileId: number | null = null;

  subjects: Subject[] = [];
  allTeachers: User[] = [];
  filteredTeachers: { id: number, name: string, professorId: number | undefined }[] = [];

  hours: string[] = Array.from({ length: 11 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00:00`;
  });

  teacherAvailableSchedules: AvailableSchedule[] = [];
  selectedAvailableSchedule: AvailableSchedule | null = null;
  timeRangeError: string | null = null;

  selectedSubjectId: number | null = null;
  selectedTeacherId: number | null = null;
  selectedStartTime: string = '';
  selectedEndTime: string = '';
  message: string = '';

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' |'info' = 'success';

  private userSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;
  private teachersForSubjectSubscription: Subscription | undefined;
  private availabilitySubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private subjectService: SubjectService,
    private userService: UserService,
    private tutoringService: TutoringService,
    private scheduleService: ScheduleService,
    private router: Router
  ) {}

   ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role?.name === 'student' && user.student) {
        this.studentProfileId = user.student.id;
        this.loadSubjectsForStudent();
      } else {
        console.warn('Acceso denegado. Solo estudiantes pueden solicitar tutorías.');
        this.router.navigate(['/dashboard/student']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
    this.teachersForSubjectSubscription?.unsubscribe();
    this.availabilitySubscription?.unsubscribe();
  }

  loadSubjectsForStudent(): void {
    if (!this.currentUser) return;

    this.dataSubscription = this.subjectService.getSubjectsForUser(this.currentUser.id).subscribe({
      next: (subjectsResponse) => {
        if (subjectsResponse.success && subjectsResponse.data) {
          this.subjects = subjectsResponse.data;
        } else {
          this.showAlert('error', subjectsResponse.message || 'Error al cargar tus asignaturas.');
          this.subjects = [];
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error al cargar tus asignaturas: ' + (err.message || 'Error desconocido.'));
        console.error('Error al cargar tus asignaturas:', err);
        this.subjects = [];
      }
    });
  }

  onSubjectChange(): void {
    this.filteredTeachers = [];
    this.selectedTeacherId = null;
    this.teacherAvailableSchedules = [];
    this.selectedAvailableSchedule = null;
    this.selectedStartTime = '';
    this.selectedEndTime = '';
    this.timeRangeError = null;

    if (!this.selectedSubjectId) {
      return;
    }

    this.teachersForSubjectSubscription = this.subjectService.getTeachersBySubject(this.selectedSubjectId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.filteredTeachers = response.data.map(user => ({
            id: user.id,
            name: user.name,
            professorId: user.professor?.id
          }));
        } else {
          this.showAlert('warning', response.message || 'No se encontraron docentes para esta asignatura.');
          this.filteredTeachers = [];
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error al cargar docentes para la asignatura: ' + (err.message || 'Error desconocido.'));
        this.filteredTeachers = [];
      }
    });
  }

  onTeacherChange(): void {
    this.teacherAvailableSchedules = [];
    this.selectedAvailableSchedule = null;
    this.selectedStartTime = '';
    this.selectedEndTime = '';
    this.timeRangeError = null;

    if (this.selectedTeacherId === null) {
      return;
    }

    const teacherIdAsNumber = Number(this.selectedTeacherId);
    if (isNaN(teacherIdAsNumber)) {
      this.showAlert('error', 'ID de docente no válido. Contacte a soporte.');
      return;
    }

    const selectedTeacherUser = this.filteredTeachers.find(t => t.id === teacherIdAsNumber);
    if (!selectedTeacherUser || !selectedTeacherUser.professorId) {
      this.showAlert('error', 'No se pudo obtener el ID del perfil del docente seleccionado. Contacte a soporte.');
      return;
    }
    const teacherProfileId = selectedTeacherUser.professorId;

    this.availabilitySubscription = this.scheduleService.getAvailabilitySchedulesForTeacher(teacherProfileId).subscribe({
      next: (response) => {
        const now = new Date();
        const filteredSlots: AvailableSchedule[] = [];

        response.data.forEach((s) => {
          if (!s.available) {
            return;
          }

          if (s.specificDate) {
            const specificDateString = s.specificDate;
            const slotDateTime = new Date(`${specificDateString}T${s.startTime}`);
            if (slotDateTime > now) {
              filteredSlots.push(s);
            }
          } else if (s.dayOfWeek) {
            const today = new Date();
            const dayIndex = this.getDayOfWeekIndex(s.dayOfWeek);
            const currentDayIndex = today.getDay();

            let targetDate = new Date(today);
            targetDate.setHours(0,0,0,0);

            if (dayIndex === currentDayIndex) {
              const slotHourMinutes = this.timeToMinutes(s.startTime);
              const nowHourMinutes = today.getHours() * 60 + today.getMinutes();
              if (slotHourMinutes <= nowHourMinutes) {
                targetDate.setDate(today.getDate() + 7);
              }
            } else if (dayIndex < currentDayIndex) {
                targetDate.setDate(today.getDate() + (7 - currentDayIndex + dayIndex));
            } else {
                targetDate.setDate(today.getDate() + (dayIndex - currentDayIndex));
            }

            const finalDesiredDateString = targetDate.toISOString().split('T')[0];
            const slotDateTime = new Date(`${finalDesiredDateString}T${s.startTime}`);
            if (slotDateTime > now) {
              filteredSlots.push({ ...s, specificDate: finalDesiredDateString, dayOfWeek: null });
            }
          }
        });

        this.teacherAvailableSchedules = filteredSlots.sort((a, b) => {
          const dateA = a.specificDate ? new Date(`${a.specificDate}T${a.startTime}`).getTime() : Infinity;
          const dateB = b.specificDate ? new Date(`${b.specificDate}T${b.startTime}`).getTime() : Infinity;

          if (dateA !== Infinity && dateB !== Infinity) return dateA - dateB;
          if (dateA !== Infinity) return -1;
          if (dateB !== Infinity) return 1;

          const dayOrder = {
            [DayOfWeek.MONDAY]: 1, [DayOfWeek.TUESDAY]: 2, [DayOfWeek.WEDNESDAY]: 3,
            [DayOfWeek.THURSDAY]: 4, [DayOfWeek.FRIDAY]: 5, [DayOfWeek.SATURDAY]: 6, [DayOfWeek.SUNDAY]: 7
          };
          if (a.dayOfWeek && b.dayOfWeek && dayOrder[a.dayOfWeek] !== dayOrder[b.dayOfWeek]) {
            return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
          }

          const timeA = this.timeToMinutes(a.startTime);
          const timeB = this.timeToMinutes(b.startTime);
          return timeA - timeB;
        });

        if (this.teacherAvailableSchedules.length === 0) {
          this.showAlert('info', 'El docente seleccionado no tiene horarios de disponibilidad próximos o registrados.');
        }
      },
      error: (err) => {
        this.showAlert('error', 'Error al cargar disponibilidad del docente: ' + (err.message || 'Error desconocido.'));
        this.teacherAvailableSchedules = [];
      }
    });
  }

  private getDayOfWeekIndex(day: DayOfWeek): number {
    switch (day) {
      case DayOfWeek.SUNDAY: return 0;
      case DayOfWeek.MONDAY: return 1;
      case DayOfWeek.TUESDAY: return 2;
      case DayOfWeek.WEDNESDAY: return 3;
      case DayOfWeek.THURSDAY: return 4;
      case DayOfWeek.FRIDAY: return 5;
      case DayOfWeek.SATURDAY: return 6;
      default: return -1;
    }
  }

  onAvailableScheduleChange(): void {
    this.selectedStartTime = '';
    this.selectedEndTime = '';
    this.timeRangeError = null;

    if (!this.selectedAvailableSchedule) {
      return;
    }

    this.selectedStartTime = this.selectedAvailableSchedule.startTime;
    this.selectedEndTime = this.selectedAvailableSchedule.endTime;
  }

  validateTimeRange(): void {
    this.timeRangeError = null;
    if (!this.selectedAvailableSchedule) {
      return;
    }
    if (!this.selectedStartTime || !this.selectedEndTime) {
      return;
    }

    const slotStartMinutes = this.timeToMinutes(this.selectedAvailableSchedule.startTime);
    const slotEndMinutes = this.timeToMinutes(this.selectedAvailableSchedule.endTime);
    const selectedStartMinutes = this.timeToMinutes(this.selectedStartTime);
    const selectedEndMinutes = this.timeToMinutes(this.selectedEndTime);

    if (selectedStartMinutes >= selectedEndMinutes) {
      this.timeRangeError = 'La hora de fin debe ser posterior a la hora de inicio.';
      return;
    }

    if (selectedStartMinutes < slotStartMinutes || selectedEndMinutes > slotEndMinutes) {
      this.timeRangeError = 'El rango de la tutoría debe estar dentro del horario de disponibilidad seleccionado.';
      return;
    }

    const durationMinutes = selectedEndMinutes - selectedStartMinutes;
    if (durationMinutes > 120) {
      this.timeRangeError = 'La duración de la tutoría no puede exceder las 2 horas.';
      return;
    }
  }

  private timeToMinutes(timeString: string): number {
    const [h, m] = timeString.split(':').map(Number);
    return h * 60 + m;
  }

  requestTutoring(): void {
    this.validateTimeRange();

    if (!this.studentProfileId || !this.selectedSubjectId || !this.selectedTeacherId || !this.selectedAvailableSchedule || !this.selectedStartTime || !this.selectedEndTime || this.timeRangeError) {
      this.showAlert('warning', 'Por favor, complete todos los campos obligatorios y corrija los errores de horario.');
      return;
    }

    const selectedTeacherUser = this.filteredTeachers.find(t => t.id === Number(this.selectedTeacherId)); // <-- ¡USAR Number() AQUÍ TAMBIÉN!
    if (!selectedTeacherUser || !selectedTeacherUser.professorId) {
      this.showAlert('error', 'No se pudo obtener el ID del perfil del docente seleccionado. Contacte a soporte.');
      return;
    }
    const teacherProfileId = selectedTeacherUser.professorId;

    let finalDesiredDate: string;

    if (this.selectedAvailableSchedule.specificDate) {
      finalDesiredDate = this.selectedAvailableSchedule.specificDate;
    } else if (this.selectedAvailableSchedule.dayOfWeek) {
      const today = new Date();
      const dayIndex = this.getDayOfWeekIndex(this.selectedAvailableSchedule.dayOfWeek);
      const currentDayIndex = today.getDay();

      let targetDate = new Date(today);
      targetDate.setHours(0,0,0,0);

      if (dayIndex === currentDayIndex) {
        const slotHourMinutes = this.timeToMinutes(this.selectedAvailableSchedule.startTime); // Usar hora del slot
        const nowHourMinutes = today.getHours() * 60 + today.getMinutes();
        if (slotHourMinutes <= nowHourMinutes) {
          targetDate.setDate(today.getDate() + 7);
        }
      } else if (dayIndex < currentDayIndex) {
          targetDate.setDate(today.getDate() + (7 - currentDayIndex + dayIndex));
      } else {
          targetDate.setDate(today.getDate() + (dayIndex - currentDayIndex));
      }

      finalDesiredDate = targetDate.toISOString().split('T')[0];

      const slotDateTime = new Date(`${finalDesiredDate}T${this.selectedStartTime}`);
      if (slotDateTime <= today) {
        this.showAlert('error', 'El horario seleccionado ya ha pasado para el día de la semana recurrente.');
        return;
      }

    } else {
        this.showAlert('error', 'No se pudo determinar la fecha deseada del horario seleccionado.');
        return;
    }

    const requestData: CreateTutoringRequest = {
      studentId: this.studentProfileId!,
      teacherId: teacherProfileId,
      subjectId: this.selectedSubjectId!,
      desiredDate: finalDesiredDate,
      startTime: this.selectedStartTime,
      endTime: this.selectedEndTime,
      message: this.message || undefined
    };

    this.tutoringService.createTutoringRequest(requestData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data as any;
          if (data.warning) {
            this.showAlert('warning', `Solicitud creada con advertencia: ${data.warning}`);
          } else {
            this.showAlert('success', 'Solicitud de tutoría creada exitosamente.');
          }
          this.resetForm();
        } else {
          this.showAlert('error', response.message || 'Error desconocido al crear solicitud.');
        }
      },
      error: (err) => {
        this.showAlert('error', err.message || 'Hubo un problema al enviar la solicitud.');
      }
    });
  }

  resetForm(): void {
    this.selectedSubjectId = null;
    this.selectedTeacherId = null;
    this.teacherAvailableSchedules = [];
    this.selectedAvailableSchedule = null;
    this.selectedStartTime = '';
    this.selectedEndTime = '';
    this.message = '';
    this.timeRangeError = null;
    this.alertVisible = false;
  }

  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.alertVisible = true;
    setTimeout(() => this.alertVisible = false, 5000);
  }
}
