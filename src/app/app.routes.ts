import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { VehicleList } from './features/vehicles/vehicle-list/vehicle-list';
import { VehicleDetail } from './features/vehicles/vehicle-detail/vehicle-detail';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'vehicles', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'vehicles', component: VehicleList, canActivate: [authGuard] },
  { path: 'vehicles/:id', component: VehicleDetail, canActivate: [authGuard] },
];
