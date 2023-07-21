import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';

type AdditionType = 'link' | 'guestName';
@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss'],
})
export class SendMessageComponent implements OnDestroy {
  @ViewChild("messageBox") messageBox: any;

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

  addToMessage(additionType: AdditionType): void {
    if (this.form && this.form.get('message')?.value) {
      const message = this.form.get('message')?.value || '';
      this.form.get('message')?.setValue(`${message} ${ additionType === 'guestName' ? this.getGuestName() : this.getLink()}`);
      this.messageBox.nativeElement.focus();
    }
  }

  submitMessage(): void {
    if (this.form && this.form.get('message')?.value) {
      const message = this.form.get('message')?.value || '';
      this.form.get('message')?.setValue(message.replace(this.getGuestName(), '$0').replace(this.getLink(), '$1'));
      this.dialogRef.close(this.form.value)
    }
  }

  private getGuestName(): string {
    return this.languageService.getActiveLanguage() === 'he'
      ? '<שם אורח/ת>'
      : '<guest name>';
  }

  private getLink(): string {
    return this.languageService.getActiveLanguage() === 'he'
      ? '<קישור>'
      : '<link>';
  }
}
