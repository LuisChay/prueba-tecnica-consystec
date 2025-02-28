import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { UsersService } from '../../services/users.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(
    private usersService: UsersService,
    private router: Router
  ) { }

    // Inicializa el objeto de usuario a partir de la interfaz User
    user: User = {
      email: '',
      password: ''
    };
  
  loginUser() {
      // Validación para que los campos no estén vacíos
      if (!this.user.email || !this.user.password) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debe completar todos los campos',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      console.log("Iniciando sesión con:", this.user);
      this.usersService.loginUser(this.user).subscribe(
        response => {
          console.log('Usuario logueado:', response);
          Swal.fire({
            icon: 'success',
            title: 'Login exitoso',
            text: 'Bienvenido',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/userview']);
          });
        },
        error => {
          console.error('Error en login:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Credenciales inválidas',
            confirmButtonText: 'OK'
          });
        }
      );
    }
    
  

}
