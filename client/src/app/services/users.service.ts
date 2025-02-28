import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {User} from '../models/user';
import { catchError, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public currentUsername: string | null = null;

  constructor(private http: HttpClient) { }


  /*
  Se registra un usuario a partir de la Interfaz en la base de datos
  */
  registerUser(user: User) {
    return this.http.post<{ success: string }>(
      'http://localhost:5000/users/register', 
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
        'http://localhost:5000/users/login', 
        user, 
        { withCredentials: true }
      ).pipe(
        switchMap(() => this.http.get<{ id: number, username: string }>(
          'http://localhost:5000/users/profile', 
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
  Se cierra sesion en la aplicacion
  */
  logoutUser() {
    localStorage.removeItem('currentUsername');
    this.currentUsername = null;
    return this.http.post('http://localhost:5000/users/logout', { withCredentials: true });
  }

  /*
  Se renueva el token del usuario
  */
  renewToken() {
    return this.http.get<{ success: string, token?: string, username?: string }>(
      'http://localhost:5000/users/renew',
      { withCredentials: true }
    );
  }
  
}
