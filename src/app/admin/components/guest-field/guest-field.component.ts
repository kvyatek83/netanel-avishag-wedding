import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

type ControlType = 'string' | 'boolean';
type ThemeType = 'fill' | 'outline';
@Component({
  selector: 'app-guest-field',
  templateUrl: './guest-field.component.html',
  styleUrls: ['./guest-field.component.scss'],
})
export class GuestFieldComponent implements OnChanges {
  @Input() externalFormControl!: FormControl;
  @Input() label!: string;

  controlType: ControlType | undefined;
  theme: ThemeType = 'outline';

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['externalFormControl']?.currentValue) {
      this.controlType =
        this.externalFormControl?.value === true ||
        this.externalFormControl?.value == false
          ? 'boolean'
          : 'string';
    }
  }
}
