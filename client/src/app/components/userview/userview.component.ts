import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TaskCardComponent } from '../taskcard/taskcard.component';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-userview',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent, RouterLink],
  templateUrl: './userview.component.html',
  styleUrl: './userview.component.css'
})
export class UserviewComponent implements OnInit {

  username: string | null = null;
  userId: string | null = null;
  tasks: Task[] = [];
  showTaskForm: boolean = false;
  filterStatus: string = 'all';
  searchTerm$ = new BehaviorSubject<string>(''); // Para la búsqueda asincrónica

  selectedTask: Task = {
    name: '', description: '', finished: false, user_id: 0,
  };

  constructor(private usersService: UsersService, private taskService: TasksService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.username = localStorage.getItem('currentUsername');
    this.userId = localStorage.getItem('currentUserId');
    this.loadTasks();

    // Manejo de búsqueda asincrónica
    this.searchTerm$.pipe(debounceTime(300)).subscribe(() => {
      this.cdr.detectChanges(); // Refrescar la vista tras el debounce
    });
  }

  // Obtener tareas desde la API
  loadTasks() {
    this.taskService.getTasks().subscribe(
      (tasks) => this.tasks = tasks,
      (error) => console.error('Error al cargar tareas:', error)
    );
  }

  // Método para capturar cambios en la barra de búsqueda
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement; // 
    this.searchTerm$.next(inputElement.value.toLowerCase().trim());
  }
  

  // Filtrar tareas por estado y búsqueda asincrónica
  get filteredTasks(): Task[] {
    let filtered = this.tasks;

    // Aplicar filtro por estado
    if (this.filterStatus === 'pending') {
      filtered = filtered.filter(task => !task.finished);
    } else if (this.filterStatus === 'completed') {
      filtered = filtered.filter(task => task.finished);
    }

    // Aplicar filtro de búsqueda
    const searchTerm = this.searchTerm$.getValue();
    if (searchTerm) {
      filtered = filtered.filter(task => task.name.toLowerCase().includes(searchTerm));
    }

    return filtered;
  }

  editTask(task: Task) {
    this.router.navigate(['/edit', task.id]);
  }

  onTaskSaved(task: Task) {
    if (task.id) {
      this.tasks = this.tasks.map(t => t.id === task.id ? task : t);
    } else {
      this.tasks.push(task);
    }
  }

  deleteTask(task: Task) {
    if (!task || task.id === undefined) {
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
          (error) => Swal.fire('Error', 'No se pudo eliminar la tarea.', 'error')
        );
      }
    });
  }

  toggleTaskState(task: Task) {
    if (!task.id) return;
  
    const previousState = task.finished;
    task.finished = !task.finished;
    this.cdr.detectChanges();
  
    this.taskService.toggleTaskState(task.id).subscribe(
      (response) => {
        task.finished = response.finished;
        this.cdr.detectChanges();
      },
      (error) => {
        task.finished = previousState;
        this.cdr.detectChanges();
      }
    );
  }

  logout() {
    Swal.fire({
      title: 'Cerrando sesión...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
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

        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error => {
        Swal.fire('Error', 'Hubo un problema cerrando sesión. Inténtalo nuevamente.', 'error');
      }
    );
  }
}
