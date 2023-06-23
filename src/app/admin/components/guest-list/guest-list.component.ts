import { Component, ViewChild } from '@angular/core';
import { AdminService, WeddingGuest } from '../../admin.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoadFileComponent } from 'src/app/components/load-file/load-file.component';
import { v4 } from 'uuid';

@Component({
  selector: 'app-guest-list',
  templateUrl: './guest-list.component.html',
  styleUrls: ['./guest-list.component.scss'],
})
export class GuestListComponent {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<WeddingGuest>;
  selection = new SelectionModel<WeddingGuest>(true, []);

  originalGuestsState: WeddingGuest[] = [];

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
  
  constructor(private adminService: AdminService, public dialog: MatDialog) {
    this.adminService
      .getAllGuests()
      .pipe()
      .subscribe((users) => {
        console.log(users);

        if (users.length > 0) {
          // this.displayedColumns = [...Object.keys(users[0])];
          this.originalGuestsState = JSON.parse(JSON.stringify(users));
          this.displayedColumns = [
            ...Object.keys(users[0]).filter((col) => col !== 'id'),
          ];
          this.dataSource = new MatTableDataSource(users);

          this.rowDef = [
            ...Object.keys(users[0]).filter((col) => col !== 'id'),
            'actions',
          ];
          this.isLoading = false;

          this.initFilter();


          this.filterType.setValue(this.displayedColumns[0]);

          this.reloadGuestListData(users)
        } else {
          console.log('No guests');
        }
      });
  }

  isValueChanged(guest: WeddingGuest, column: string): boolean {
    const originalGuestDetails = this.originalGuestsState.find(
      (user) => user.id === guest.id
    );
    return originalGuestDetails ? (guest as any)[column] !== (originalGuestDetails as any)[column] : true;
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

  revertChanges(guest: WeddingGuest): void {
    const originalGuestDetails = this.originalGuestsState.find(
      (user) => user.id === guest.id
    );

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
    const a =  JSON.stringify(this.dataSource.filteredData) === JSON.stringify(this.selection.selected)
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

  openUploadFile(): void {
    const dialogRef = this.dialog.open(LoadFileComponent, {
      panelClass: "dialog-responsive"
    });

    dialogRef.afterClosed().subscribe((users: WeddingGuest[]) => {
      if (users) {
        let cloneGuestList: WeddingGuest[] = JSON.parse(JSON.stringify(this.dataSource.data));
        users.forEach((user: WeddingGuest) => {
          const guestIndex = this.dataSource.data.findIndex(guest => {
            if (user.id) {
              return guest.id === user.id;
            } else if (guest.phone === user.phone) {
              user.id = guest.phone === user.phone ? guest.id : v4();
              return true;
            }
            return false;
          })
          if (guestIndex > -1) {
            cloneGuestList[guestIndex] = user;
          } else {
            cloneGuestList = [...cloneGuestList, user]
          }
        })

        console.log(cloneGuestList);
        
        this.reloadGuestListData(cloneGuestList)
        // this.dataSource = new MatTableDataSource(cloneGuestList);
        // setTimeout(() => {
        //   this.dataSource.paginator = this.paginator;
        //   this.dataSource.sort = this.sort;
        // }, 0);
      }
    });
  }

  openMessageBot(): void {
    // Dailog for guest messages
  }

  private reloadGuestListData(guests: WeddingGuest[]): void {
    this.dataSource = new MatTableDataSource(guests);
          this.totalConfirmation = this.dataSource.data.filter(guest => guest.confirmation === true).length;
          this.totalTransport = this.dataSource.data.filter(guest => guest.transport === true).length;
          this.totalParticipants = this.dataSource.data.reduce((curGuest, nextGuest) =>  curGuest + Number(nextGuest.participants), 0);
          this.totalGuests = this.dataSource.data.length;
          
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
  }
}