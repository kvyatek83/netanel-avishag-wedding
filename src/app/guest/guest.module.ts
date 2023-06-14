import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestRoutingModule } from './guest-routing.module';
import { GuestComponent } from './components/guest/guest.component';


@NgModule({
  declarations: [
    GuestComponent
  ],
  imports: [
    CommonModule,
    GuestRoutingModule
  ]
})
export class GuestModule { }
