import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginPageComponent } from './components/login-page/login-page.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent, data: { title: 'Login' } },
  {
    path: 'guest',
    loadChildren: () => import('./guest/guest.module').then(m => m.GuestModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'guest', pathMatch: 'full'},
  { path: '**', redirectTo: 'guest' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
