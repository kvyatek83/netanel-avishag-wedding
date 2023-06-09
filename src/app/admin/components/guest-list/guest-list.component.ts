import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AdminService, WeddingGuest } from '../../admin.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoadFileComponent } from 'src/app/admin/components/load-file/load-file.component';
import { v4 } from 'uuid';
import {
  Subject,
  catchError,
  filter,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/lang.service';
import { NewGuestComponent } from '../new-guest/new-guest.component';
import { SendMessageComponent } from '../send-message/send-message.component';

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
  isLoading = true;
  rowDef: string[] = [];

  guestFormControls: { [key: string]: FormControl } = {};
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
    private languageService: LanguageService
  ) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
    this.adminService
      .getAllGuests()
      .pipe(
        take(1),
        catchError((error) => {
          if (error.status === 403 || error.status === 500) {
            console.log('Please login');
            this.router.navigate(['/login']);
          }
          return of([]);
        })
      )
      .subscribe((users: WeddingGuest[]) => {
        this.initGuestsTable(users);
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

  initFilter(): void {
    this.filterType.valueChanges.subscribe((type) => {
      if (type !== null) {
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

  editRow(guest: WeddingGuest, saveChanges: boolean) {
    if (saveChanges) {
      this.saveAllValuesForRowIndex(guest);
    }

    this.guestFormControls = {};
    this.editIsOn = false;
    guest.editing = false;
  }

  startEditGuestDetails(guest: WeddingGuest): void {
    this.editIsOn = true;
    Object.keys(guest).forEach((key) => {
      if (this.guestFormControls) {
        this.guestFormControls[key] = new FormControl(
          (guest as any)[key],
          Validators.required
        );
      }
    });

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
      row[columnName] = this.guestFormControls[columnName].value;
    });

    console.log(`Saving row data to the server...`);
    // Implement logic to save rowData to your server API
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
        users: this.dataSource.data.map((guest) => guest.phone),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((user) => !!user))
      .subscribe((user: WeddingGuest) => {
        this.reloadGuestListData([...this.dataSource.data, user]);
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
        let cloneGuestList: WeddingGuest[] = JSON.parse(
          JSON.stringify(this.dataSource.data)
        );
        users.forEach((user: WeddingGuest) => {
          const guestIndex = this.dataSource.data.findIndex((guest) => {
            if (user.id) {
              return guest.id === user.id;
            } else if (guest.phone === user.phone) {
              user.id = guest.phone === user.phone ? guest.id : v4();
              return true;
            }
            return false;
          });
          if (guestIndex > -1) {
            cloneGuestList[guestIndex] = user;
          } else {
            cloneGuestList = [...cloneGuestList, user];
          }
        });

        this.reloadGuestListData(cloneGuestList);
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
      .subscribe((a) => {
        this.selection.clear();
        console.log(a);
      });
  }

  downloadDb(): void {
    this.adminService.downloadDb().subscribe((file: Blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = 'guest-list.csv';
      link.click();
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
        this.initGuestsTable(newGuestList);
      });
  }

  saveListToDB(): void {
    this.isLoading = true;
    // const updatedGuestList = this.dataSource.data.filter((guest) => {
    //   const userIndex = this.originalGuestsState.findIndex(
    //     (user) => user.id === guest.id
    //   );

    //   // not fully work
    //   return guest?.deleted !== true && userIndex > -1;
    // });

    this.adminService
      .saveChangesToDB(this.dataSource.data)
      .pipe(take(1))
      .subscribe((newGuestList: WeddingGuest[]) => {
        this.initGuestsTable(newGuestList);
      });
  }

  private initGuestsTable(users: WeddingGuest[]): void {
    if (users?.length > 0) {
      this.originalGuestsState = JSON.parse(JSON.stringify(users));
      this.displayedColumns = [
        ...Object.keys(users[0])
          .filter((col) => col !== 'id')
          .sort((curr, next) =>
            curr === 'hebrewname' ? -1 : next === 'hebrewname' ? 1 : 0
          ),
      ];

      this.dataSource = new MatTableDataSource(users);

      this.rowDef = [
        ...Object.keys(users[0]).filter((col) => col !== 'id'),
        'actions',
      ];

      this.isLoading = false;

      this.initFilter();
      this.filterType.setValue(this.displayedColumns[0]);

      this.reloadGuestListData(users);
    } else {
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
}
