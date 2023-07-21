import { Component, Inject, OnDestroy } from '@angular/core';
import { LanguageService } from 'src/app/services/lang.service';
import { Observable, Subject, of, switchMap, takeUntil, timer } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControlStatus,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { v4 } from 'uuid';

export function PhoneValidator(
  control: AbstractControl
): ValidationErrors | null {
  const phone = control.value;
  const israeli_phone_regex = /^((\+972|0)?(([23489]{2}\d{7})|[57]\d{8}))$/;

  if (phone) {
    if (israeli_phone_regex.test(phone)) {
      return null; // return null if validation passes
    } else {
      return { phoneInvalidError: true }; // return error object if validation fails
    }
  }
  return null;
}

@Component({
  selector: 'app-new-guest',
  templateUrl: './new-guest.component.html',
  styleUrls: ['./new-guest.component.scss'],
})
export class NewGuestComponent implements OnDestroy {
  isRtl = false;
  userExist = true;
  phoneNumberValid = true;
  guestForm = this.fb.group({
    id: [v4()],
    username: [null],
    hebrewname: [null, [Validators.required]],
    password: [null],
    role: ['guest'],
    phone: [
      null,
      {
        validators: [Validators.required, PhoneValidator],
        asyncValidators: [this.israeliPhoneExistsValidator()],
      },
    ],
    email: [null],
    confirmation: [false],
    transport: [false],
    participants: [0, [Validators.required, Validators.min(0)]],
  });

  private destroy$: Subject<void> = new Subject();
  phoneLabel: string | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { users: string[] },
    private languageService: LanguageService,
    private fb: FormBuilder
  ) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));

    this.guestForm
      .get('phone')
      ?.statusChanges.pipe(takeUntil(this.destroy$))
      .subscribe((status: FormControlStatus) => {
        if (status === 'VALID') {
          this.phoneLabel = undefined;
        } else {
          this.phoneLabel = Object.keys(
            this.guestForm.get('phone')?.errors ?? {}
          )[0];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private israeliPhoneExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(0).pipe(
        switchMap(() => {
          const phone = control.value;
          const index = this.data?.users.findIndex(
            (userPhone: string) =>
              this.convertToIsraeliPhone(userPhone) ===
              this.convertToIsraeliPhone(phone)
          );
          if (index > -1) {
            return of({ phoneExistsError: true });
          } else {
            return of(null);
          }
        })
      );
    };
  }

  private convertToIsraeliPhone(phone: string | null): string | null {
    if (phone && phone.startsWith('+972')) {
      return phone.replace('+972', '0');
    }
    return phone;
  }
}