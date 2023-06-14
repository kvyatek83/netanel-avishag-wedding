import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { GuestComponent } from './components/guest/guest.component';
import { HomeComponent } from '../components/home/home.component';

const routes: Routes = [
  {path: '', component: GuestComponent, data: { title: 'Guest' }},
  {path: ':id', component: GuestComponent, data: { title: 'Guest' }},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuestRoutingModule { }
