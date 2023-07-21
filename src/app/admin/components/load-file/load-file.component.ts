import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import * as Papa from 'papaparse';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';
import { NotificationsService } from 'src/app/services/notifications.service';

// remove and use global
interface WeddingGuest {
  confirmation: boolean;
  email?: string;
  hebrewname: string;
  id: string;
  participants: string;
  phone: string;
  transport: boolean;
  username?: string;
  role?: string;
  editing?: boolean;
}

export interface DialogData {
  uploadType: 'local' | 'remote';
}

@Component({
  selector: 'app-load-file',
  templateUrl: './load-file.component.html',
  styleUrls: ['./load-file.component.scss'],
  animations: [
    trigger('messageState', [
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate(
          '0.5s ease-in-out',
          style({
            opacity: 1
          })
        )
      ]),
      transition('* => void', [
        animate(
          '0.5s ease-in-out',
          style({
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class LoadFileComponent implements OnDestroy {
  private readonly hebrewHeadersMap: Map<string, string> = new Map<
    string,
    string
  >([
    ['שם', 'hebrewname'],
    ['מספר משתתפים', 'participants'],
    ['מספר טלפון', 'phone'],
    ['מאושר הגעה', 'confirmation'],
    ['הסעה', 'transport'],
  ]);

  private readonly hebrewBooleanMap: Map<string, boolean> = new Map<
    string,
    boolean
  >([
    ['לא', false],
    ['כן', true],
  ]);

  newGuestList: WeddingGuest[] | undefined;
  files: any[] = [];
  isRtl = false;
  doneUploadFiles = true;

  private destroy$: Subject<void> = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private languageService: LanguageService,
    private notificationsService: NotificationsService,
    private translocoService: TranslocoService
  ) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));

    if (this.data.uploadType === 'remote') {
      this.notificationsService.setNotification({
        type: 'WARNING',
        message: this.translocoService.translate(
          'notifications.warning.superAdmin'
        ),
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * on file drop handler
   */
  onFileDropped(event: any) {
    this.prepareFilesList(event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(event: any) {
    if (event.target.files) {
      this.prepareFilesList(event.target.files);
    }
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.newGuestList = undefined;
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        this.doneUploadFiles = true;
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    const file = files[0];
    if (file.type === 'text/csv' || file.type === 'application/json') {

      if (this.files.length) {
        this.files.splice(0, 1);
        this.newGuestList = undefined;
      }
      
      file.progress = 0;
      this.files.push(file);
      this.doneUploadFiles = false;
      this.uploadFilesSimulator(0);
      this.onFileSelect(file);
    } else {
      this.notificationsService.setNotification({
        type: 'ERROR',
        message: this.translocoService.translate(
          'notifications.errors.fileFormat'
        ),
      });
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  onFileSelect(file: any): void {
    const fileReader = new FileReader();

    if (file.type === 'text/csv') {
      fileReader.readAsText(file);
      fileReader.onload = () => {
        const csvData = fileReader.result;
        if (this.data.uploadType === 'remote') {
          Papa.parse(csvData as string, {
            header: true,
            complete: (result) => {
              this.newGuestList = result.data as WeddingGuest[];
            },
            error: (error: any) => {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  'notifications.errors.csvParse'
                ),
              });
              console.error('Error parsing CSV:', error);
            },
          });
        } else {
          this.parseCSV(csvData as string);
        }
      };
    } else if (file.type === 'application/json') {
      fileReader.readAsText(file);
      fileReader.onload = () => {
        this.newGuestList = JSON.parse(fileReader.result as string);
      };
    }
  }

  private parseCSV(csvData: string): void {
    Papa.parse(csvData, {
      header: true,
      complete: (result) => {
        this.newGuestList = [];
        result.data.forEach((row: any) => {
          const newObj: any = {};
          Object.entries(row).forEach(([key, value]) => {
            newObj[this.parseHebrewHeader(key)] = this.parseHebewValue(
              value as string
            );
          });

          if ((newObj as WeddingGuest).confirmation === undefined) {
            (newObj as WeddingGuest).confirmation = false;
          }
          if ((newObj as WeddingGuest).transport === undefined) {
            (newObj as WeddingGuest).transport = false;
          }
          if ((newObj as WeddingGuest).participants === undefined) {
            (newObj as WeddingGuest).participants = '1';
          }
          if ((newObj as WeddingGuest).role === undefined) {
            (newObj as WeddingGuest).role = 'guest';
          }

          this.newGuestList?.push(newObj);
        });

        this.notificationsService.setNotification({
          type: 'INFO',
          message: this.translocoService.translate(
            'notifications.info.convertComplete'
          ),
        });
      },
      error: (error: any) => {
        this.notificationsService.setNotification({
          type: 'ERROR',
          message: this.translocoService.translate(
            'notifications.errors.csvParse'
          ),
        });
        console.error('Error parsing CSV:', error);
      },
    });
  }
  private parseHebrewHeader(value: string): string {
    return this.hebrewHeadersMap.get(value) ?? value;
  }

  private parsePhoneNumber(value: string): string {
    // If israeli number remove leading zeros chars or israeli prefix
    if (value.includes('="05')) {
      return value.replace(/[^a-zA-Z0-9 ]/g, '');
    } else if (value.charAt(0) == '+972') {
      return value.replace('+972', '0');
    }
    return value;
  }

  private parseHebewValue(value: string): string | boolean | undefined {
    // In case it's bool
    if (this.hebrewBooleanMap.get(value) !== undefined) {
      return this.hebrewBooleanMap.get(value);
    }

    // In case it's phone number
    if (
      value.includes('="0') ||
      value.charAt(0) == '+' ||
      value.includes('05')
    ) {
      return this.parsePhoneNumber(value);
    } else {
      return value;
    }
  }
}
