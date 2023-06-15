import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { AdminComponent } from './components/admin/admin.component';
import { GuestListComponent } from './components/guest-list/guest-list.component';

const routes: Routes = [
  { path: '', 
    component: AdminComponent, 
    data: { title: 'Admin' }, 
    canActivate: [AuthGuard],
    children: [{ 
      path: '',
      component: GuestListComponent,
      data: { title: 'Guest list' }, 
    },
    { 
      path: 'guest-list',
      component: GuestListComponent,
      data: { title: 'Guest list' }, 
    }]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
