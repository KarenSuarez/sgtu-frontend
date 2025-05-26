import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-estudiante',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class StudentDashboardComponent implements OnInit {
  hours = ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];
  days: string[] = [];
  schedule: {
    [hour: string]: { [day: string]: { class: string; professor: string } };
  } = {};
  subjects: { name: string; professor: string }[] = []; // Removed 'students'
  selectedSubject = '';
  tutorias: {
    hour: string;
    day: string;
    subject: string | null;
    status: string;
  }[] = [];
  program: string = '';
  programs: string[] = [];
  userName: string = 'Estudiante Name';
  currentView: string = 'inicio';
  selectedHour = '';
  selectedDay = '';
  requestingTutoria: {
    hour: string;
    day: string;
    subject: string | null;
  } | null = null;
  isSidebarCollapsed = false;
  isUserMenuOpen = false;


  constructor(private router: Router) {}

  ngOnInit() {
    this.generateWeekDays();
    this.fetchSubjects();
    this.fetchSchedule();
    this.loadTutorias();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    // Implement logout logic here
    console.log('Cerrar Sesión');
    this.router.navigate(['/login']);
  }

  generateWeekDays() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    this.days = [];
    for (let i = 0; i < 6; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dayName = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i];
      const dayFormatted = `${dayName} <span class="math-inline">\{
currentDay\.getDate\(\)
\}/</span>{currentDay.getMonth() + 1}`;
      this.days.push(dayFormatted);
    }
  }

  fetchSubjects() {
    // Placeholder for fetching student's subjects from a service/API
    this.subjects = [
      { name: 'Cálculo I', professor: 'Dr. Matemáticas' },
      { name: 'Programación Básica', professor: 'Ing. Sistemas' },
      { name: 'Física General', professor: 'Lic. Física' },
    ];
  }

  fetchSchedule() {
    // Placeholder for fetching student's schedule from a service/API
    this.schedule = {
      '7': { 'Lun 26/5': { class: 'Cálculo I', professor: 'Dr. Matemáticas' } },
      '9': { 'Lun 26/5': { class: 'Programación Básica', professor: 'Ing. Sistemas' } },
      '11': { 'Mar 27/5': { class: 'Física General', professor: 'Lic. Física' } },
      // ... more schedule data
    };
  }

  loadTutorias() {
    // Placeholder for loading student's requested tutorias from a service/API
    this.tutorias = [
      { hour: '14', day: 'Mié 28/5', subject: 'Cálculo I', status: 'Pendiente' },
      { hour: '10', day: 'Vie 30/5', subject: 'Programación Básica', status: 'Aprobada' },
    ];
  }

  navigateTo(path: string) {
    this.currentView = path;
    this.requestingTutoria = null; // Reset requestingTutoria when navigating
  }

  isOccupied(hour: string, day: string) {
    return this.schedule[hour]?.[day]?.class;
  }

  requestTutoria(subjectName: string) {
    this.selectedSubject = subjectName;
    this.requestingTutoria = {
      subject: subjectName,
      day: '',
      hour: '',
    };
    this.navigateTo('tutorias');
  }

  addTutoriaRequest() {
    if (this.selectedHour && this.selectedDay && this.selectedSubject) {
      this.requestingTutoria = {
        subject: this.selectedSubject,
        day: this.selectedDay,
        hour: this.selectedHour,
      };
    }
  }

  confirmTutoriaRequest() {
    if (this.requestingTutoria) {
      this.tutorias.push({
        hour: this.requestingTutoria.hour,
        day: this.requestingTutoria.day,
        subject: this.requestingTutoria.subject,
        status: 'Pendiente', // Default status for a new request
      });
      // Optionally, send this request to a service/API
      this.selectedHour = '';
      this.selectedDay = '';
      this.selectedSubject = '';
      this.requestingTutoria = null;
    }
  }

  cancelTutoria(tutoria: {
    hour: string;
    day: string;
    subject: string | null;
    status: string;
  }) {
    const index = this.tutorias.findIndex(
      (t) =>
        t.hour === tutoria.hour &&
        t.day === tutoria.day &&
        t.subject === tutoria.subject
    );
    if (index > -1) {
      this.tutorias.splice(index, 1);
      // Optionally
// You might want to call a service here to update the backend
    }
  }

  downloadSchedule() {
    // Implement download logic
    console.log('Descargar Horario');
  }

  saveSchedule() {
    // Implement save logic
    console.log('Guardar Horario');
  }

  exportSchedule() {
    // Implement export logic
    console.log('Exportar Horario');
  }
}
