import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private messageService: MessageService
  ) { }

  login() {
    console.log('Intentando iniciar sesión:', this.credentials);
    this.authService.login(this.credentials).subscribe(
      response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.messageService.add({
            key: 'bc',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Inicio de sesión exitoso'
          });
          setTimeout(() => this.router.navigate(['/usuarios']), 1000);
        }
      },
      error => {
        console.error('Error en el inicio de sesión', error);
        this.messageService.add({
          key: 'bc',
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error en el inicio de sesión'
        });
      }
    );
  }
} 