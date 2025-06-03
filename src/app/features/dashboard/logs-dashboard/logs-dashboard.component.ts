import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common'; 
import { LogService } from '../../../core/services/log.service';
import { AuthService } from '../../../core/services/auth.service';
import { LogEntry, PaginatedLogsResponse } from '../../../core/models/report.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-logs-dashboard',
  templateUrl: './logs-dashboard.component.html',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule, DatePipe], 
  styleUrls: ['./logs-dashboard.component.css']
})
export class LogsDashboardComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isUserMenuOpen = false;
  userName: string = 'Administrador';

  logs: LogEntry[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalLogs: number = 0;
  totalPages: number = 0;

  filterUserId: number | null = null;
  filterUserEmail: string = '';
  filterAction: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  private userSubscription: Subscription | undefined;
  private logsSubscription: Subscription | undefined;

  constructor(
    public router: Router, 
    private logService: LogService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || 'Administrador';
        if (user.role?.name === 'admin') {
          this.loadLogs();
        } else {
          console.warn('Acceso denegado a Logs Dashboard para roles no-admin.');
          this.router.navigate(['/dashboard/student']);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.logsSubscription?.unsubscribe();
  }

  loadLogs(): void {
    const filters = {
      userId: this.filterUserId || undefined,
      userEmail: this.filterUserEmail || undefined,
      action: this.filterAction || undefined,
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined,
    };

    this.logsSubscription = this.logService.getLogs(filters, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.logs = response.data.logs;
          this.totalLogs = response.data.total;
          this.totalPages = response.data.totalPages;
        } else {
          console.error('Error al cargar logs:', response.message);
          this.logs = [];
        }
      },
      error: (err) => {
        console.error('Error HTTP al cargar logs:', err);
        this.logs = [];
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxButtons = 5; 
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(this.totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  }


  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateTo(view: string): void { 
    this.router.navigate([view]);
  }
}
