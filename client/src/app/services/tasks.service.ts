import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Task } from '../models/task';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private baseUrl = 'http://localhost:5000/tasks';

  constructor(private http: HttpClient) {}

  //  Crear una tarea
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/create`, task).pipe(
      catchError(this.handleError)
    );
  }

  //  Obtener todas las tareas de un usuario
  getTasks(): Observable<Task[]> {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return throwError(() => new Error('Usuario no autenticado'));

    return this.http.get<Task[]>(`${this.baseUrl}/get_tasks/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  //  Obtener una tarea por ID
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/get_task/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  //  Actualizar una tarea
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/update/${task.id}`, task).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar una tarea
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Cambiar el estado de una tarea
  toggleTaskState(taskId: number): Observable<{ finished: boolean }> {
    return this.http.put<{ finished: boolean }>(`${this.baseUrl}/toggle_finished/${taskId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  //  Manejo de errores en HTTP
  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error('Error en la operación, intenta de nuevo.'));
  }
}
