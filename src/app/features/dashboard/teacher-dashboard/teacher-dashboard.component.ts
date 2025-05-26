import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class TeacherDashboardComponent implements OnInit {
  hours = ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];
  days: string[] = [];
  schedule: { [hour: string]: { [day: string]: { class: string } } } = {};
  availability: { [hour: string]: { [day: string]: boolean } } = {};
  subjects: { name: string; students: number }[] = [];
  tutorias: { hour: string; day: string; subject: string | null }[] = [];
  selectedSubject = '';
  selectedHour = '';
  selectedDay = '';
  editingTutoria: { hour: string; day: string; subject: string | null } | null = null;
  program = '';
  programs: string[] = [];
  userName: string = 'Nombre del Docente';
  currentView: string = 'inicio';
  isSidebarCollapsed = false;
  isUserMenuOpen = false;
  isCollapsed = true;



  ngOnInit() {
    this.generateWeekDays();
    this.fetchSubjects();
    this.fetchSchedule();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  constructor(private router: Router) {}
  logout() {
    // Aquí puedes implementar la lógica de cierre de sesión (limpiar tokens, etc.)
    console.log('Cerrar Sesión');
    this.router.navigate(['/login']); // Redirige a la página de login
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
      const formatted = `${dayName} ${currentDay.getDate()}/${currentDay.getMonth() + 1}`;
      this.days.push(formatted);
    }
  }

  fetchSubjects() {
    this.subjects = [];
  }

  fetchSchedule() {
    this.schedule = {};
  }

  navigateTo(view: string) {
    this.currentView = view;
    if (view === 'tutorias') {
      this.editingTutoria = null;
    }
  }

  isOccupied(hour: string, day: string) {
    return this.schedule[hour]?.[day]?.class;
  }

  programTutoria(subjectName: string) {
    this.selectedSubject = subjectName;
    this.navigateTo('tutorias');
  }

  addTutoria() {
    if (this.selectedHour && this.selectedDay && (this.selectedSubject || this.availability[this.selectedHour]?.[this.selectedDay])) {
      this.tutorias.push({ hour: this.selectedHour, day: this.selectedDay, subject: this.selectedSubject || null });
      this.availability[this.selectedHour][this.selectedDay] = false;
      this.selectedHour = '';
      this.selectedDay = '';
      this.selectedSubject = '';
    }
  }

  editTutoria(tutoria: { hour: string; day: string; subject: string | null }) {
    this.editingTutoria = { ...tutoria };
    this.selectedHour = tutoria.hour;
    this.selectedDay = tutoria.day;
    this.selectedSubject = tutoria.subject || '';
    this.navigateTo('tutorias');
  }

  saveEditedTutoria() {
    if (this.editingTutoria && this.selectedHour && this.selectedDay && (this.selectedSubject || this.availability[this.selectedHour]?.[this.selectedDay])) {
      const index = this.tutorias.findIndex(t => t.hour === this.editingTutoria!.hour && t.day === this.editingTutoria!.day && t.subject === this.editingTutoria!.subject);
      if (index > -1) {
        this.tutorias.splice(index, 1);
        this.availability[this.editingTutoria.hour][this.editingTutoria.day] = true;
        this.tutorias.push({ hour: this.selectedHour, day: this.selectedDay, subject: this.selectedSubject || null });
        this.availability[this.selectedHour][this.selectedDay] = false;
        this.editingTutoria = null;
        this.selectedHour = '';
        this.selectedDay = '';
        this.selectedSubject = '';
      }
    }
  }

  deleteTutoria(tutoria: { hour: string; day: string; subject: string | null }) {
    const index = this.tutorias.findIndex(t => t.hour === tutoria.hour && t.day === tutoria.day && t.subject === tutoria.subject);
    if (index > -1) {
      this.tutorias.splice(index, 1);
      this.availability[tutoria.hour][tutoria.day] = true;
    }
  }

  downloadSchedule() {
    // pendiente
  }

  saveSchedule() {
    // pendiente
  }

  exportSchedule() {
    // pendiente
  }
}
