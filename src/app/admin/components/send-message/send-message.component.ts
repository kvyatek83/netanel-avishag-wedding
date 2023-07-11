import { Component, Inject, OnDestroy } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss'],
})
export class SendMessageComponent implements OnDestroy {
  isRtl = false;

  private destroy$: Subject<void> = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { users: string[] },
    private languageService: LanguageService,
    private fb: FormBuilder
  ) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
