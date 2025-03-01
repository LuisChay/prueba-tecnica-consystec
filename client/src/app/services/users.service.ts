import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { catchError, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl = 'http://localhost:5000/users'; // Base URL de la API
  public currentUsername: string | null = null;

  constructor(private http: HttpClient) {}

  /*
  Se registra un usuario a partir de la Interfaz en la base de datos
  */
  registerUser(user: User) {
    return this.http.post<{ success: string }>(
      `${this.apiUrl}/register`, 
      user
    ).pipe(
      catchError(error => {
        if (error.status === 409) {
          return throwError(() => new Error('El correo ya está registrado'));
        }
        return throwError(() => new Error('Error en el registro'));
      })
    );
  }
  
  /* 
    Se loguea un usuario a partir de la Interfaz en la base de datos
    Se verifica que la sesion se mantenga activa con el token
  */
  loginUser(user: User) {
    return this.http.post<{ success: string }>(
      `${this.apiUrl}/login`, 
      user, 
      { withCredentials: true }
    ).pipe(
      switchMap(() => this.http.get<{ id: number, username: string }>(
        `${this.apiUrl}/profile`, 
        { withCredentials: true }
      )),
      tap(response => {
        localStorage.setItem('currentUserId', response.id.toString());
        localStorage.setItem('currentUsername', response.username);
        console.log('Usuario validado:', response.username, 'ID:', response.id);
      })
    );
  }

  /*
  Se cierra sesión en la aplicación
  */
  logoutUser() {
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('currentUserId');
    this.currentUsername = null;
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  /*
  Se renueva el token del usuario
  */
  renewToken() {
    return this.http.get<{ success: string, token?: string, username?: string }>(
      `${this.apiUrl}/renew`,
      { withCredentials: true }
    );
  }
}
