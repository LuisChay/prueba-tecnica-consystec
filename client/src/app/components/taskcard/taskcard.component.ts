import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task'; // Asegúrate de importar el modelo
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-taskcard',
  imports: [CommonModule, RouterLink],
  templateUrl: './taskcard.component.html',
})
export class TaskCardComponent {
  @Input() task!: Task; // Recibimos la tarea completa

  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() toggleState = new EventEmitter<Task>();
  router: any;

  editTask() {
    this.router.navigate(['/edit', this.task.id]);
  }
  
  deleteTask() {
    console.log('Eliminar tarea:', this.task); // Debug
    this.delete.emit(this.task); // Enviar la tarea completa
  }

  toggleTaskState() {
    this.toggleState.emit(this.task);
  }
}
