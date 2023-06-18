import { Component, ViewChild } from '@angular/core';
import { AdminService, WeddingGuest } from '../../admin.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';

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

  constructor(private adminService: AdminService) {
    // console.log(this.csvToJson());

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
          console.log(this.filterType.value);
          
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
        } else {
          console.log('No guests');
        }
      });
  }

  // public csvToJson(): any[] {
  //   const csvData = `col1,col2,col3
  //   value1,value2,value3
  //   value4,value5,value6`;
  //   const rows = csvData.split('\n');
  //   const headers = rows?.shift()?.split(',');

  //   return rows.map((row) => {
  //     const rowData = row.split(',');
  //     return headers?.reduce(
  //       (accumulator: { [key: string]: any }, header, index) => {
  //         accumulator[header] = rowData[index];
  //         return accumulator;
  //       },
  //       { editing: false } // Add this property for editing purposes
  //     );
  //   });
  // }

  isValueChanged(guest: WeddingGuest, column: string): boolean {
    const originalGuestDetails = this.originalGuestsState.find(
      (user) => user.id === guest.id
    );
    return (guest as any)[column] !== (originalGuestDetails as any)[column];
  }

  initFilter(): void {
    this.filterType.valueChanges.subscribe((type) => {
      if (type !== null) {
        this.dataSource.filterPredicate = (
          data: WeddingGuest,
          filterValue: string
        ): boolean => {
          // const a = (data as any)[type];
          // if (a typeof string) {

          // } else if (a typeof Boolean) {
          //   a
          // }
          return (data as any)[type].toLowerCase().includes(filterValue);
        };
      }
    });

    this.filterValue.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.dataSource.filter = value.trim().toLowerCase();
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
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

  onCellValueChanged(element: any, column: string, newValue: any) {
    console.log(newValue);

    element[column] = newValue;
  }

  saveAllValuesForRowIndex(row: any) {
    this.displayedColumns.forEach((col) => {
      let columnName = col === 'actions' ? 'editing' : col;
      row[columnName] = this.guestFormControls[columnName].value;
    });

    console.log(`Saving row data to the server...`);
    console.log(row);

    // const index = this.dataSource.data.indexOf(row);
    // this.dataSource = new MatTableDataSource(users);
    // console.log(index);

    // this.dataSource = new MatTableDataSource(users);

    //     this.rowDef = [...Object.keys(users[0]).filter(col => col !== 'id'), 'actions'];
    //     this.isLoading = false;
    //     setTimeout(() => {
    //       this.dataSource.paginator = this.paginator;
    //       this.dataSource.sort = this.sort;
    //     }, 0);
    // this.dataSource.data[index] = rowData;

    // Implement logic to save rowData to your server API
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    // select only non filterd 
    this.selection.select(...this.dataSource.data);
  }
}
