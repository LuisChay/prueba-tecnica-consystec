import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { UsersService } from '../../services/users.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private usersService: UsersService, private router: Router) { }

  user: User = {
    username: '',
    email: '',
    password: ''
  };

  registerUser() {
    // Validar que ningún campo esté vacío
    if (!this.user.username || !this.user.email || !this.user.password) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe completar todos los campos',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    console.log("Registrando usuario:", this.user);

    // Llama al servicio para registrar el usuario
    // SI el registro es exitoso, muestra alerta de éxito y redirige a la vista principal
    // SI hay un error, muestra alerta de error y redirige a la vista principal
    this.usersService.registerUser(this.user).subscribe(
      response => {
        console.log('Usuario registrado:', response);
        // Muestra alerta de éxito y redirige a la vista principal
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Usuario registrado correctamente',
          confirmButtonText: 'OK'
        }).then(() => {
          // Limpia el formulario
          this.user = { username: '', email: '', password: '' };
          // Redirige a la vista principal
          this.router.navigate(['/']);
        });
      },
      error => {
        console.error('Error registrando usuario:', error);
        // Muestra alerta de error y redirige a la vista principal
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar el usuario',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/']);
        });
      }
    );
  }
  
}
