import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: { username: string; role: string } | null = null;

  login(username: string, password: string): boolean {
    // Simulación de usuarios
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'tutor', password: 'tutor123', role: 'tutor' },
      { username: 'estudiante', password: 'estudiante123', role: 'student' },
    ];

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = { username: user.username, role: user.role };
      return true;
    }
    return false;
  }

  getUser() {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
