import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './components/admin/admin.component';
import { GuestListComponent } from './components/guest-list/guest-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoRootModule } from '../transloco-root.module';
import { DndDirective } from './directives/dnd.directive';
import { LoadFileComponent } from './components/load-file/load-file.component';
import { BooleanSpanComponent } from './components/boolean-span/boolean-span.component';
import { GuestFieldComponent } from './components/guest-field/guest-field.component';
import { MaterialModule } from '../material.module';
import { NewGuestComponent } from './components/new-guest/new-guest.component';
import { SendMessageComponent } from './components/send-message/send-message.component';

@NgModule({
  declarations: [
    AdminComponent,
    GuestListComponent,
    LoadFileComponent,
    DndDirective,
    BooleanSpanComponent,
    GuestFieldComponent,
    NewGuestComponent,
    SendMessageComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoRootModule,
    MaterialModule
  ]
})
export class AdminModule { }
