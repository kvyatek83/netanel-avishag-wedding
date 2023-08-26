import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AdminService, MessagesRes, WeddingGuest } from '../../admin.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoadFileComponent } from 'src/app/admin/components/load-file/load-file.component';
import { v4 } from 'uuid';
import {
  Observable,
  Subject,
  catchError,
  filter,
  of,
  switchMap,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/lang.service';
import { NewGuestComponent } from '../new-guest/new-guest.component';
import { SendMessageComponent } from '../send-message/send-message.component';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslocoService } from '@ngneat/transloco';
import { PlatformService } from 'src/app/services/platform.sevice';
import { NotificationType } from '../../../services/notifications.service';

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
  selector: 'app-guest-list',
  templateUrl: './guest-list.component.html',
  styleUrls: ['./guest-list.component.scss'],
})
export class GuestListComponent implements OnDestroy {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<WeddingGuest>;
  selection = new SelectionModel<WeddingGuest>(true, []);

  originalGuestsState: WeddingGuest[] = [];

  isRtl = false;
  isMobile = false;
  isLoading = true;

  guestFormControls: FormGroup = this.fb.group({});
  editIsOn = false;
  filterValue = new FormControl('');
  filterType = new FormControl('');

  totalConfirmation: number | undefined;
  totalTransport: number | undefined;
  totalParticipants: number | undefined;
  totalGuests: number | undefined;

  private destroy$: Subject<void> = new Subject();

  constructor(
    private adminService: AdminService,
    public dialog: MatDialog,
    private router: Router,
    private languageService: LanguageService,
    private notificationsService: NotificationsService,
    private translocoService: TranslocoService,
    private fb: FormBuilder,
    private platformService: PlatformService
  ) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));

    this.platformService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mobile) => (this.isMobile = mobile));

    this.adminService
      .getAllGuests()
      .pipe(
        take(1),
        catchError((error) => {
          if (error.status === 403 || error.status === 500) {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translocoService.translate(
                'notifications.errors.loginAgain'
              ),
            });
            this.router.navigate(['/login']);
          }
          return of(null);
        })
      )
      .subscribe((users: WeddingGuest[] | null) => {
        if (users) {
          this.originalGuestsState = JSON.parse(JSON.stringify(users));
          this.initGuestsTable(users);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isValueChanged(guest: WeddingGuest, column: string): boolean {
    const originalGuestDetails = this.originalGuestsState.find(
      (user) => user.id === guest.id
    );
    return originalGuestDetails
      ? (guest as any)[column] !== (originalGuestDetails as any)[column]
      : true;
  }

  noLocalChangesMade(): boolean {
    const loacl: WeddingGuest[] = JSON.parse(
      JSON.stringify(this.dataSource.data)
    );
    return (
      JSON.stringify(this.originalGuestsState) ===
      JSON.stringify(
        loacl.map((guest) => {
          delete guest?.editing;

          const index = this.originalGuestsState.findIndex(
            (user) => user.id === guest.id
          );
          if (index > -1 && guest?.deleted) {
            return guest;
          } else {
            delete guest?.deleted;
            return guest;
          }
        })
      )
    );
  }

  editRow(guest: WeddingGuest, saveChanges: boolean) {
    if (saveChanges) {
      this.saveAllValuesForRowIndex(guest);
    }

    this.guestFormControls = this.fb.group({});
    this.editIsOn = false;
    guest.editing = false;
  }

  startEditGuestDetails(guest: WeddingGuest): void {
    this.editIsOn = true;
    const initGuestForm: { [key: string]: FormControl } = {};
    Object.keys(guest).forEach((key) => {
      if (key === 'phone') {
        initGuestForm[key] = new FormControl((guest as any)[key], {
          validators: [Validators.required, PhoneValidator],
          asyncValidators: [this.israeliPhoneExistsValidator(guest.phone)],
        });
      } else if (key === 'participants') {
        initGuestForm[key] = new FormControl((guest as any)[key], [
          Validators.required,
          Validators.min(0),
        ]);
      } else if (key === 'hebrewname') {
        initGuestForm[key] = new FormControl((guest as any)[key], [
          Validators.required,
        ]);
      } else {
        initGuestForm[key] = new FormControl((guest as any)[key]);
      }
    });
    this.guestFormControls = this.fb.group(initGuestForm);

    guest.editing = !guest.editing;
  }

  removeGuestFromList(guest: WeddingGuest): void {
    guest.deleted = true;
  }

  revertChanges(guest: WeddingGuest): void {
    const originalGuestDetails = this.originalGuestsState.find(
      (user) => user.id === guest.id
    );

    if (guest.deleted) {
      guest.deleted = false;
    }

    if (originalGuestDetails) {
      this.displayedColumns.forEach((col) => {
        let columnName = col === 'actions' ? 'editing' : col;
        (guest as any)[columnName] = (originalGuestDetails as any)[columnName];
      });
    }
  }

  saveAllValuesForRowIndex(row: any) {
    this.displayedColumns.forEach((col) => {
      let columnName = col === 'actions' ? 'editing' : col;
      row[columnName] = this.guestFormControls?.get(columnName)?.value;
    });
  }

  isAllSelected() {
    // Need more tests
    const a =
      JSON.stringify(this.dataSource.filteredData) ===
      JSON.stringify(this.selection.selected);
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return a;
    // return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    // select only non filterd
    this.selection.select(...this.dataSource.filteredData);
  }

  addNewGuest(): void {
    const dialogRef = this.dialog.open(NewGuestComponent, {
      panelClass: 'dialog-responsive',
      data: {
        users: this.dataSource?.data
          ? this.dataSource.data.map((guest) => guest.phone)
          : [],
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((user) => !!user))
      .subscribe((user: WeddingGuest) => {
        user.participants = user.participants.toString();
        user.phone = this.convertToIsraeliPhone(user.phone);

        if (this.dataSource) {
          this.reloadGuestListData([...this.dataSource.data, user]);
        } else {
          this.initGuestsTable([user]);
        }
      });
  }

  openUploadFile(): void {
    const dialogRef = this.dialog.open(LoadFileComponent, {
      panelClass: 'dialog-responsive',
      data: {
        uploadType: 'local',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((user) => !!user))
      .subscribe((users: WeddingGuest[]) => {
        if (this.dataSource) {
          let cloneGuestList: WeddingGuest[] = JSON.parse(
            JSON.stringify(this.dataSource.data)
          );
          users.forEach((user: WeddingGuest) => {
            const guestIndex = this.dataSource.data.findIndex((guest) => {
              if (user.id) {
                return guest.id === user.id;
              } else if (guest.phone === user.phone) {
                user.id = guest.id;
                return true;
              } else {
                user.id = v4();
                return false;
              }
            });
            if (guestIndex > -1) {
              cloneGuestList[guestIndex] = user;
            } else {
              cloneGuestList = [...cloneGuestList, user];
            }
          });

          this.reloadGuestListData(cloneGuestList);
        } else {
          users.forEach((user) => (user.id = v4()));
          this.initGuestsTable(users);
        }
      });
  }

  sendMessage(): void {
    const dialogRef = this.dialog.open(SendMessageComponent, {
      panelClass: 'dialog-responsive',
      data: {
        selectedUsers: this.selection.selected.length,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((params) => !!params),
        switchMap((params: { message: string; invitation: boolean }) => {
          // this.isLoading = true;
          return this.adminService.sendMessage(
            params.message,
            params.invitation,
            this.selection.selected
          );
        })
      )
      .subscribe((res: MessagesRes) => {
        this.messagesStatusNotification(res);
        this.selection.clear();
      });
  }

  private messagesStatusNotification(res: MessagesRes): void {
    switch (res.status) {
      case 'SUCCESS':
        this.notificationsService.setNotification({
          type: 'SUCCESS',
          message: this.translocoService.translate(
            `notifications.success.${res.messages}`
          ),
        });
        break;
      case 'INFO':
        this.notificationsService.setNotification({
          type: 'INFO',
          message: this.translocoService.translate(
            `notifications.info.${res.messages}`,
            { sent: res.params.sent, failed: res.params.failed }
          ),
        });
        break;
      case 'ERROR':
        this.notificationsService.setNotification({
          type: 'ERROR',
          message: this.translocoService.translate(
            `notifications.errors.${res.messages}`
          ),
        });
        break;

      default:
        break;
    }
  }

  downloadList(): void {
    this.adminService
      .downloadGuestList()
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

  downloadDb(): void {
    this.adminService
      .downloadDb()
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

  uploadNewFileToDB(): void {
    const dialogRef = this.dialog.open(LoadFileComponent, {
      panelClass: 'dialog-responsive',
      data: {
        uploadType: 'remote',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((users: WeddingGuest[]) => !!users),
        switchMap((users: WeddingGuest[]) => {
          this.isLoading = true;
          return this.adminService.replaceDB(users);
        })
      )
      .subscribe((newGuestList: WeddingGuest[]) => {
        this.originalGuestsState = JSON.parse(JSON.stringify(newGuestList));
        this.initGuestsTable(newGuestList);
      });
  }

  saveListToDB(): void {
    this.isLoading = true;
    const updatedGuestList = this.dataSource.data
      .filter((guest) => {
        const userIndex = this.originalGuestsState.findIndex(
          (user) => user.id === guest.id
        );

        return userIndex !== -1 || (userIndex === -1 && !guest?.deleted);
      })
      .map((user) => {
        user.phone = this.convertToIsraeliPrefixedPhone(user.phone);
        return user;
      });

    this.adminService
      .saveChangesToDB(updatedGuestList)
      .pipe(take(1))
      .subscribe((newGuestList: WeddingGuest[]) => {
        this.originalGuestsState = JSON.parse(JSON.stringify(newGuestList));
        this.initGuestsTable(newGuestList);
      });
  }

  private initGuestsTable(users: WeddingGuest[]): void {
    if (users?.length > 0) {
      this.displayedColumns = [
        ...Object.keys(users[0])
          .filter((col) => col !== 'id' && col !== 'role' && col !== 'password')
          .sort((curr, next) =>
            curr === 'hebrewname' ? -1 : next === 'hebrewname' ? 1 : 0
          ),
      ];

      this.dataSource = new MatTableDataSource(users);

      this.isLoading = false;

      this.initFilter();
      this.filterType.setValue(this.displayedColumns[0]);

      this.reloadGuestListData(users);
    } else {
      this.notificationsService.setNotification({
        type: 'WARNING',
        message: this.translocoService.translate(
          'notifications.errors.recivedEmptyGuestList'
        ),
      });
      this.isLoading = false;
      console.log('No guests');
    }
  }

  private reloadGuestListData(guests: WeddingGuest[]): void {
    this.dataSource = new MatTableDataSource(guests);
    this.totalConfirmation = this.dataSource.data.filter(
      (guest) => guest.confirmation === true
    ).length;
    this.totalTransport = this.dataSource.data.filter(
      (guest) => guest.transport === true
    ).length;
    this.totalParticipants = this.dataSource.data.reduce(
      (curGuest, nextGuest) => curGuest + Number(nextGuest.participants),
      0
    );
    this.totalGuests = this.dataSource.data.length;

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, 0);
  }

  private initFilter(): void {
    this.filterType.valueChanges.subscribe((type) => {
      if (type !== null) {
        this.filterValue.setValue('');
        this.dataSource.filterPredicate = (
          data: WeddingGuest,
          filterValue: string
        ): boolean => {
          if (filterValue === 'true' || filterValue === 'false') {
            const val = filterValue === 'true' ? true : false;
            return (data as any)[type] === val;
          } else {
            return (data as any)[type].toLowerCase().includes(filterValue);
          }
        };
      }
    });

    this.filterValue.valueChanges.subscribe((value) => {
      if (value === null || value === undefined) {
        value = '';
      }

      this.dataSource.filter = value.toString().trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  private convertToIsraeliPhone(phone: string): string {
    if (phone.startsWith('+972')) {
      return phone.replace('+972', '0');
    }
    return phone;
  }

  private downloadFile(file: Blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'guest-list.csv';
    link.click();
    this.notificationsService.setNotification({
      type: 'SUCCESS',
      message: this.translocoService.translate('notifications.success.file'),
    });
  }

  private convertToIsraeliPrefixedPhone(phone: string): string {
    if (phone.startsWith('05')) {
      return phone.replace('05', '+9725');
    }
    return phone;
  }

  private israeliPhoneExistsValidator(
    currentGuestPhone: string
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(0).pipe(
        switchMap(() => {
          const phone = control.value;
          if (
            this.convertToIsraeliPhone(currentGuestPhone) ===
            this.convertToIsraeliPhone(phone)
          ) {
            return of(null);
          }
          const index = this.dataSource.data.findIndex(
            (user: WeddingGuest) =>
              this.convertToIsraeliPhone(user.phone) ===
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
}
