import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestRoutingModule } from './guest-routing.module';
import { GuestComponent } from './components/guest/guest.component';
import { LoadingComponent } from '../components/loading/loading.component';
import { TranslocoRootModule } from '../transloco-root.module';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GuestComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule,
    GuestRoutingModule,
    TranslocoRootModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class GuestModule { }
