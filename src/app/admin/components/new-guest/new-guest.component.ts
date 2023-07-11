import { Component, Inject, OnDestroy } from '@angular/core';
import { LanguageService } from 'src/app/services/lang.service';
import { Subject, takeUntil } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { v4 } from 'uuid';

@Component({
  selector: 'app-new-guest',
  templateUrl: './new-guest.component.html',
  styleUrls: ['./new-guest.component.scss']
})
export class NewGuestComponent implements OnDestroy {
  isRtl = false;
  userExist = true;
  phoneNumberValid = true;
  guestForm = this.fb.group({
    id: [v4()],
    username: [null],
    hebrewname: [null, Validators.required],
    password: [null],
    role: ['guest'],
    phone: [null, Validators.required],
    email: [null],
    confirmation: [false],
    transport: [false],
    participants: [1],
  })

  private destroy$: Subject<void> = new Subject();

  constructor(@Inject(MAT_DIALOG_DATA) public data: {users: string[]}, private languageService: LanguageService, private fb: FormBuilder) {
    this.languageService.rtl$.pipe(takeUntil(this.destroy$)).subscribe(rtl => this.isRtl = rtl);

    this.guestForm.get('phone')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((phone: string | null) => {
      
      // need better regex
      this.phoneNumberValid = phone?.length === 10 && phone.startsWith('05');
      const index = data?.users.findIndex((userPhone: string) => userPhone === phone);
      if (index > -1) {
        this.userExist = true;
      } else {
        this.userExist = false;
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}