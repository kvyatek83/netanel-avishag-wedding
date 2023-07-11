import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-boolean-span',
  templateUrl: './boolean-span.component.html',
  styleUrls: ['./boolean-span.component.scss']
})
export class BooleanSpanComponent {
  @Input() spanValue!: string | boolean;

  typeOf(value: any) {
    return typeof value;
  }
}
