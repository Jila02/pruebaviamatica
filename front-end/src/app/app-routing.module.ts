import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {UserComponent } from './users/users.component';
import { AuthGuard } from './services/auth.guard';
import { LoginGuard } from './services/login.guard';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {path:'',
    redirectTo:'/login',
    pathMatch:'full'
  },
  {
    path:'login',canActivate:[LoginGuard],component:LoginComponent
  },
  {
    path:'users',canActivate:[AuthGuard],component:UserComponent
  },
  {
    path:'home',canActivate:[AuthGuard],component:HomeComponent
  },
  {
    path:'dashboard', canActivate:[AuthGuard],component:DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
