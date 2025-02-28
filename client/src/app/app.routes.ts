import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';
import { UserviewComponent } from './components/userview/userview.component';

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
            path: 'userview',
            component: UserviewComponent
        }
];
