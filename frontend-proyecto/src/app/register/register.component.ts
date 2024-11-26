import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  usuario = {
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router, private messageService: MessageService) { }

  register() {
    if (!this.usuario.nombre || !this.usuario.apellido || !this.usuario.email || !this.usuario.password) {
      this.messageService.add({
        key: 'bc',
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos'
      });
      return;
    }

    this.authService.register(this.usuario).subscribe(
      response => {
        this.messageService.add({
          key: 'bc',
          severity: 'success',
          summary: 'Éxito',
          detail: 'Registro exitoso'
        });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error => {
        this.messageService.add({
          key: 'bc',
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'Error en el registro'
        });
      }
    );
  }
} 