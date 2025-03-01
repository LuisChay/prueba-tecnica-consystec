import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service'
import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TaskFormComponent } from '../taskform/taskform.component';
import { TaskCardComponent } from '../taskcard/taskcard.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-userview',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskCardComponent, RouterLink],
  templateUrl: './userview.component.html',
  styleUrl: './userview.component.css'
})
export class UserviewComponent implements OnInit {

  username: string | null = null;
  userId: string | null = null;
  tasks: Task[] = [];
  showTaskForm: boolean = false;

  // En lugar de `null`, usa un objeto vacío con valores predeterminados
  selectedTask: Task = {
    name: '', description: '', finished: false, user_id: 0,
  };

  constructor(private usersService: UsersService, private taskService: TasksService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.username = localStorage.getItem('currentUsername');
    this.userId = localStorage.getItem('currentUserId');
    this.loadTasks();
  }

  // Cargar tareas
  loadTasks() {
    this.taskService.getTasks().subscribe(
      (tasks) => this.tasks = tasks,
      (error) => console.error('Error al cargar tareas:', error)
    );
  }

  // Alternar la visibilidad del formulario y asignar una nueva tarea
  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm;
    console.log('toggleTaskForm ejecutado, showTaskForm:', this.showTaskForm); // Depuración
    this.cdr.detectChanges(); // Forzar actualización de la UI
  
    if (this.showTaskForm) {
      this.selectedTask = {
        name: '',
        description: '',
        finished: false,
        user_id: parseInt(this.userId || '0', 10),
      };
    }
  }

  // Editar una tarea existente
  editTask(task: Task) {
    this.router.navigate(['/edit', task.id]); //Redirigir con el ID de la tarea
  }

  // Guardar la tarea (crear o actualizar)
  onTaskSaved(task: Task) {
    console.log('Tarea guardada:', task); // Depuración
    if (task.id) {
      this.tasks = this.tasks.map(t => t.id === task.id ? task : t);
    } else {
      this.tasks.push(task);
    }
  }
  

  deleteTask(task: Task) {
    if (!task || task.id === undefined) { // Asegurarnos de que el task no sea undefined
      console.error('Error: La tarea es undefined o no tiene un ID válido');
      Swal.fire('Error', 'No se puede eliminar una tarea sin ID.', 'error');
      return;
    }
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(task.id!).subscribe(
          () => {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            Swal.fire('Eliminado', 'La tarea ha sido eliminada', 'success');
          },
          (error) => {
            console.error('Error al eliminar tarea:', error);
            Swal.fire('Error', 'No se pudo eliminar la tarea.', 'error');
          }
        );
      }
    });
  }
  
  toggleTaskState(task: Task) {
    if (!task.id) {
      console.error('Error: La tarea no tiene un ID válido');
      return;
    }
  
    // Guardamos el estado anterior en caso de error
    const previousState = task.finished;
  
    // Actualizamos la UI inmediatamente
    task.finished = !task.finished;
    this.cdr.detectChanges(); // Forzar actualización de la UI
  
    this.taskService.toggleTaskState(task.id).subscribe(
      (response) => {
        task.finished = response.finished; // Confirmar cambio en la API
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al cambiar el estado de la tarea:', error);
        task.finished = previousState; // Revertir si hay error
        this.cdr.detectChanges();
      }
    );
  }
  

  logout() {
    Swal.fire({
      title: 'Cerrando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.usersService.logoutUser().subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Redirigiendo a la página principal...',
          timer: 2000,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error => {
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