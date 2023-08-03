import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

type ControlType = 'string' | 'boolean' | 'phone' | 'number';
type ThemeType = 'fill' | 'outline';
@Component({
  selector: 'app-guest-field',
  templateUrl: './guest-field.component.html',
  styleUrls: ['./guest-field.component.scss'],
})
export class GuestFieldComponent implements OnChanges {
  @Input() externalFormControl!: AbstractControl;
  @Input() label!: string;
  @Input() isRtl = false;

  controlType: ControlType | undefined;
  theme: ThemeType = 'outline';

  formcontreol!: FormControl;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['externalFormControl']?.currentValue) {
      this.formcontreol = this.externalFormControl as FormControl;
      this.controlType =
        this.externalFormControl?.value === true ||
        this.externalFormControl?.value === false
          ? 'boolean'
          : this.externalFormControl?.value.startsWith('+972') ||
            this.externalFormControl?.value.startsWith('05')
          ? 'phone' 
          : this.externalFormControl?.value && !isNaN(this.externalFormControl?.value)
          ? 'number'
          : 'string';
    }
  }
}
