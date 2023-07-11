import { Component, Inject, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, startWith, takeUntil } from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss'],
})
export class SendMessageComponent implements OnDestroy {
  isRtl = false;
  form = this.fb.group({
    message: ['', Validators.required],
    invitation: [false],
  });

  private destroy$: Subject<void> = new Subject();

  constructor(
    public dialogRef: MatDialogRef<SendMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedUsers: number },
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

  addLink(): void {
    if (this.form && this.form.get('message')?.value) {
      const g = this.form.get('message')?.value || '';
      this.form.get('message')?.setValue(`${g} ${this.getLink()}`);
    }
  }

  submitMessage(): void {
    if (this.form && this.form.get('message')?.value) {
      const g = this.form.get('message')?.value || '';
      this.form.get('message')?.setValue(g.replace(this.getLink(), '$1'));
      this.dialogRef.close(this.form.value)
    }
  }

  private getLink(): string {
    return this.languageService.getActiveLanguage() === 'he'
      ? '<קישור>'
      : '<link>';
  }
}
