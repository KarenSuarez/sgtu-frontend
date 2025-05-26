import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = '';
  password = '';

  private testCredentials = {
    tutor: { usuario: 'tutor@uptc.edu.co', password: 'tutor123' },
    estudiante: { usuario: 'estudiante@uptc.edu.co', password: 'estudiante123' }
  };
  constructor(private router: Router) {}

  login(): void {
    const { usuario, password } = this;

    if (usuario === this.testCredentials.tutor.usuario && password === this.testCredentials.tutor.password) {
      this.router.navigate(['/teacher']);
    } else if (usuario === this.testCredentials.estudiante.usuario && password === this.testCredentials.estudiante.password) {
      this.router.navigate(['/student']);
    } else {
      alert('Credenciales incorrectas.');
    }
  }
}
