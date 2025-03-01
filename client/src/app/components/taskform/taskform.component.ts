import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Task } from '../../models/task';
import { TasksService } from '../../services/tasks.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './taskform.component.html',
  styleUrls: ['./taskform.component.css']
})
export class TaskFormComponent implements OnInit {
  task: Task = { name: '', description: '', finished: false, user_id: 0 };
  isEditing: boolean = false;
  isLoading: boolean = false;
  currentUserId: number | null = null;
  @Output() taskSaved = new EventEmitter<Task>();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TasksService
  ) {}

  ngOnInit() {
    this.currentUserId = parseInt(localStorage.getItem('currentUserId') || '0', 10);
  
    this.route.paramMap.subscribe(params => {
      const taskId = params.get('id');
      if (taskId) {
        this.isEditing = true;
        this.loadTask(Number(taskId)); // Convertimos de manera segura
      } else {
        this.task.user_id = this.currentUserId ?? 0; // Asignar el ID del usuario actual
      }
    });
    
  }
  
  async loadTask(id: number) {
    try {
      this.task = await firstValueFrom(this.taskService.getTask(id));
      console.log('Tarea cargada:', this.task);
    } catch (error) {
      console.error('Error al cargar la tarea:', error);
    }
  }
  

  async onSubmit() {
    if (!this.task.name.trim() || !this.task.description.trim()) return;
  
    this.isLoading = true;
  
    try {
      let savedTask: Task;
      if (this.isEditing) {
        savedTask = await firstValueFrom(this.taskService.updateTask(this.task));

        Swal.fire({
          title: '¡Tarea editada!',
          text: 'Los cambios han sido guardados correctamente.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/tasks']);
        });
  
        return;
      } else {

        savedTask = await firstValueFrom(this.taskService.createTask(this.task));
         Swal.fire({
          title: '¡Tarea creada!',
          text: 'La tarea se ha guardado exitosamente.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/tasks']); // Redirigir después de la alerta
        });

        return;

      }
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
