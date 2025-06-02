import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-logs-dashboard',
  templateUrl: './logs-dashboard.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./logs-dashboard.component.css']
})

export class LogsDashboardComponent {
  isSidebarCollapsed = false;
  isUserMenuOpen = false;
  
  constructor(private router: Router) {}

   logs: string[] = [
    '✅ [INFO] Sistema iniciado correctamente',
    '⚠️ [WARN] Tiempo de respuesta alto en módulo X',
    '✅ [INFO] Sistema iniciado correctamente',
    '❌ [ERROR] Fallo en la conexión coimport'
   ]

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }


  
}
