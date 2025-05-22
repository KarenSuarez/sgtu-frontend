import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Iniciar sesión</h2>
      <input [(ngModel)]="username" placeholder="Usuario" />
      <input [(ngModel)]="password" type="password" placeholder="Contraseña" />
      <button (click)="login()">Ingresar</button>
    </div>
  `,
  styleUrls: ['./login.component.css'] // ¡Agrega esta línea!
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    const success = this.auth.login(this.username, this.password);
    if (success) {
      const user = this.auth.getUser();
      if (user) {
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/dashboard/admin']);
            break;
          case 'tutor':
            this.router.navigate(['/dashboard/docente']);
            break;
          case 'student':
            this.router.navigate(['/dashboard/estudiante']);
            break;
          default:
            alert('Rol desconocido');
        }
      } else {
        alert('No se pudo obtener el usuario');
      }
    } else {
      alert('Credenciales incorrectas');
    }
  }
}
