import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';
import { UserviewComponent } from './components/userview/userview.component';
import { TaskFormComponent } from './components/taskform/taskform.component';

export const routes: Routes = [
        {
            path: 'login',
            component: LoginComponent
        },
        {
            path: 'register',
            component: RegisterComponent
        },
        {
            path: '',
            component: LandingComponent
        },
        {
            path: 'tasks',
            component: UserviewComponent
        },
        {
            path: 'task/form',
            component: TaskFormComponent
        },
        {
            path: 'edit/:id',
            component: TaskFormComponent
        }
];
