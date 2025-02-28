import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { switchMap, tap } from 'rxjs';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})

export class TasksService {

  constructor(private http: HttpClient) { }

  createTask(task: Task) {
    return this.http.post('http://localhost:5000/tasks/create', task);
  }

  getTasks(user_id: string) {
    return this.http.get(`http://localhost:5000/tasks/get_tasks/${user_id}`);
  }

  getTask(id: string) {
    return this.http.get(`http://localhost:5000/tasks/get_task/${id}`);
  }

  updateTask(task: Task) {
    return this.http.put(`http://localhost:5000/tasks/update/${task.id}`, task);
  }

  deleteTask(id: string) {
    return this.http.delete(`http://localhost:5000/tasks/delete/${id}`);
  }
}
