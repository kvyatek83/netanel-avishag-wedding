import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

type ControlType = 'string' | 'boolean' | 'phone';
type ThemeType = 'fill' | 'outline';
@Component({
  selector: 'app-guest-field',
  templateUrl: './guest-field.component.html',
  styleUrls: ['./guest-field.component.scss'],
})
export class GuestFieldComponent implements OnChanges {
  @Input() externalFormControl!: FormControl;
  @Input() label!: string;
  @Input() isRtl = false;

  controlType: ControlType | undefined;
  theme: ThemeType = 'outline';


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['externalFormControl']?.currentValue) {
      this.controlType =
        this.externalFormControl?.value === true ||
        this.externalFormControl?.value == false
          ? 'boolean'
          : this.externalFormControl?.value.startsWith('+972') ||
            this.externalFormControl?.value.startsWith('05')
          ? 'phone'
          : 'string';
    }
  }
}
