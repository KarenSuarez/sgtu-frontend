// src/app/features/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core'; // Añadir OnInit
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomAlertComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { // Implementar OnInit
  // Modelo de datos del formulario
  userPartialEmail = ''; // Solo la parte del usuario antes del dominio
  password = '';
  domain = '@uptc.edu.co'; // Dominio fijo

  // Variables para validación y UI
  isPasswordVisible = false;
  isSubmitting = false; // Para deshabilitar el botón durante el envío

  // Mensajes de validación en línea
  userError: string | null = null;
  passwordError: string | null = null;

  // Alerta general (para errores de credenciales, etc.)
  alertVisible = false;
  alertMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Puedes verificar si el usuario ya está autenticado al iniciar el componente
    // if (this.authService.isAuthenticated()) {
    //   this.authService.getAuthenticatedUser().subscribe(user => {
    //     this.redirectToDashboard(user);
    //   });
    // }
  }

  // Toggle para ver/ocultar contraseña
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // Validaciones en línea
  validateUser(): void {
    if (!this.userPartialEmail.trim()) {
      this.userError = 'El campo usuario es obligatorio.';
    } else {
      this.userError = null;
    }
  }

  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError = 'El campo contraseña es obligatorio.';
    } else {
      this.passwordError = null;
    }
  }

  // Lógica de inicio de sesión
  login(): void {
    // Forzar validación al intentar enviar
    this.validateUser();
    this.validatePassword();

    // Si hay errores, no proceder
    if (this.userError || this.passwordError) {
      this.showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.isSubmitting = true; // Deshabilitar botón
    this.alertVisible = false; // Ocultar alerta anterior

    // Construir el email completo con el dominio
    const fullEmail = `${this.userPartialEmail.trim()}${this.domain}`;
    const credentials = { email: fullEmail, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (authResponse) => {
        this.isSubmitting = false;
        this.redirectToDashboard(authResponse.user);
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMessage = err.error?.message || err.message || 'Credenciales incorrectas.';
        this.showAlert('error', errorMessage);
      }
    });
  }

  // Método auxiliar para redirigir según el rol
  private redirectToDashboard(user: User): void {
    const roleName = user.role?.name;
    if (roleName === 'teacher') {
      this.router.navigate(['dashboard/teacher']);
    } else if (roleName === 'student') {
      this.router.navigate(['dashboard/student']);
    } else if (roleName === 'admin') {
      this.router.navigate(['dashboard/admin']);
    } else {
      this.router.navigate(['/']); // Ruta por defecto
    }
  }

  // Mostrar alerta general
  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertMessage = message;
    this.alertVisible = true;
    // La alerta se cerrará automáticamente por su componente custom-alert o por un temporizador si lo implementas.
    // setTimeout(() => this.alertVisible = false, 5000); // Esto ya lo controla CustomAlertComponent
  }
}
