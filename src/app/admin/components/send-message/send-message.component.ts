import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Subject,
  catchError,
  map,
  mergeMap,
  of,
  retryWhen,
  takeUntil,
  throwError,
  timer,
} from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';
import { AdminService } from '../../admin.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslocoService } from '@ngneat/transloco';
const QRious = require('qrious');

type AdditionType = 'link' | 'guestName';
@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss'],
})
export class SendMessageComponent implements OnDestroy {
  @ViewChild('messageBox') messageBox: any;

  private readonly MAX_RETRY_ATTEMPTS = 1;
  private readonly RETRY_DELAY_MS = 3000;

  isRtl = false;
  form = this.fb.group({
    message: ['', Validators.required],
    invitation: [false],
  });

  botStatus = false;
  checkingBotStatus = false;
  qrCode = '';

  private destroy$: Subject<void> = new Subject();

  constructor(
    public dialogRef: MatDialogRef<SendMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedUsers: number },
    private languageService: LanguageService,
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationsService: NotificationsService,
    private translocoService: TranslocoService,
  ) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));

    this.tryConnectBot();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToMessage(additionType: AdditionType): void {
    if (this.form && this.form.get('message')?.value) {
      const message = this.form.get('message')?.value || '';
      this.form
        .get('message')
        ?.setValue(
          `${message} ${
            additionType === 'guestName' ? this.getGuestName() : this.getLink()
          }`
        );
      this.messageBox.nativeElement.focus();
    }
  }

  submitMessage(): void {
    if (this.form && this.form.get('message')?.value) {
      const message = this.form.get('message')?.value || '';
      this.form
        .get('message')
        ?.setValue(
          message
            .replace(this.getGuestName(), '$0')
            .replace(this.getLink(), '$1')
        );
      this.dialogRef.close(this.form.value);
    }
  }

  downloadGuestsMessages(): void {
    this.adminService
    .downloadGuestMessages()
    .pipe(
        catchError((error) => {
          this.notificationsService.setNotification({
            type: 'ERROR',
            message: this.translocoService.translate(
              'notifications.errors.general'
            ),
          });
          return of(null);
        })
      )
      .subscribe((file: Blob | null) => {
        if (file) {
          this.downloadFile(file);
        }
      });
  }

  tryConnectBot(): void {
    this.checkingBotStatus = true;

    let retryAttempts = 0;
    this.adminService
      .getBotStatus()
      .pipe(
        map((status) => {
          if (!!status) {
            this.botStatus = status;
            return '';
          } else {
            throw new Error('Status is false');
          }
        }),
        retryWhen((errors) => {
          return errors.pipe(
            mergeMap((error) => {
              if (retryAttempts++ < this.MAX_RETRY_ATTEMPTS) {
                console.log('Retrying... Attempt number: ' + retryAttempts);
                return timer(this.RETRY_DELAY_MS);
              } else {
                console.log('Max retries exceeded');
                // throw different error to be caught in catchError
                throw new Error('MaxRetriesExceeded');
              }
            })
          );
        }),
        catchError((error) => {
          if (error.message === 'MaxRetriesExceeded') {
            this.botStatus = false;
            // Maximum retries exceeded. Call a different API.
            return this.adminService.getBotQrCode(); // replace with your other API call
          } else {
            // If it's not the 'MaxRetriesExceeded' error, rethrow.
            return throwError(error);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (qr) => {
          if (qr) {
            this.qrCode = qr;
            setTimeout(() => {
              this.generateQR(qr);
              this.checkingBotStatus = false;
            }, 500);
          } else {
            this.checkingBotStatus = false;
          }
        },
        (error) => {
          this.checkingBotStatus = false;
          console.error(error);
        }
      );
  }

  private generateQR(qrData: string) {
    const parent = document.getElementsByClassName('qr-holder')[0];
    parent.innerHTML = ''; // Resetting QR Code area
    let qr = new QRious({
      element: parent,
      size: 450,
      value: qrData,
      level: 'H',
    });
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

  private downloadFile(file: Blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'guest-messages.csv';
    link.click();
    this.notificationsService.setNotification({
      type: 'SUCCESS',
      message: this.translocoService.translate('notifications.success.file'),
    });
  }
}
