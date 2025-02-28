import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import Swal from 'sweetalert2';
import { Task } from '../../models/task';
import { TaskCardComponent } from '../taskcard/taskcard.component';
import { CommonModule } from '@angular/common'; 


@Component({
  selector: 'app-userview',
  imports: [TaskCardComponent, FormsModule, CommonModule],
  templateUrl: './userview.component.html',
  styleUrl: './userview.component.css'
})
export class UserviewComponent {

  username: string | null = null;
  userId: string | null = null;
  tasks: Task[] = [];


  ngOnInit() {
    // Recuperar usuario de localStorage
    this.username = localStorage.getItem('currentUsername');
    this.userId = localStorage.getItem('currentUserId');
  }

  constructor(private usersService: UsersService, private router: Router) { }

  user: User = {
    username: '',
    email: '',
    password: ''
  };

  task: Task = {
    title: '',
    description: '',
    completed: false

  };

  logout() {
    // Mostrar spinner de carga antes de cerrar sesión
    Swal.fire({
      title: 'Cerrando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.usersService.logoutUser().subscribe(
      response => {
        console.log('Usuario deslogueado:', response);
  
        // Mostrar mensaje de éxito con duración de 3 segundos
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Redirigiendo a la página principal...',
          timer: 2000, // Duración de 3 segundos
          showConfirmButton: false
        });
  
        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
  
      error => {
        console.error('Error deslogueando usuario:', error);
        
        // Mostrar mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema cerrando sesión. Inténtalo nuevamente.',
          timer: 3000,
          showConfirmButton: false
        });
      }
    );
  }


}
