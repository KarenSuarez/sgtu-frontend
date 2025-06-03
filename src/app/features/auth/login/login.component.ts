import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  userPartialEmail = '';
  password = '';
  domain = '@uptc.edu.co';

  isPasswordVisible = false;
  isSubmitting = false;

  userError: string | null = null;
  passwordError: string | null = null;

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

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

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

  login(): void {
    this.validateUser();
    this.validatePassword();

    if (this.userError || this.passwordError) {
      this.showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.isSubmitting = true;
    this.alertVisible = false;

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

  private redirectToDashboard(user: User): void {
    const roleName = user.role?.name;
    if (roleName === 'teacher') {
      this.router.navigate(['dashboard/teacher']);
    } else if (roleName === 'student') {
      this.router.navigate(['dashboard/student']);
    } else if (roleName === 'admin') {
      this.router.navigate(['dashboard/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }

  showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.alertMessage = message;
    this.alertVisible = true;
  }
}