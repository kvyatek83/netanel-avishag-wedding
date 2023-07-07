import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestComponent } from './components/guest/guest.component';
import { ForYourInfoComponent } from './components/for-your-info/for-your-info.component';

const routes: Routes = [
  {path: 'for-your-information', component: ForYourInfoComponent, data: { title: 'FYI' }},
  {path: '', component: GuestComponent, data: { title: 'Guest' }},
  {path: ':id', component: GuestComponent, data: { title: 'Guest' }},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuestRoutingModule { }
