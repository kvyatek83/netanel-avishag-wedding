import { Component, ViewChild } from '@angular/core';
import { AdminService, WeddingGuest } from '../../admin.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

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
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
        } else {
          console.log('No guests');
        }
      });
  }

  public csvToJson(): any[] {
    const csvData = `col1,col2,col3
    value1,value2,value3
    value4,value5,value6`;
    const rows = csvData.split('\n');
    const headers = rows?.shift()?.split(',');

    return rows.map((row) => {
      const rowData = row.split(',');
      return headers?.reduce(
        (accumulator: { [key: string]: any }, header, index) => {
          accumulator[header] = rowData[index];
          return accumulator;
        },
        { editing: false } // Add this property for editing purposes
      );
    });
  }

  isValueChanged(element: WeddingGuest, column: string): boolean {
    // const index = this.dataSource.data.indexOf(element);
    const a = this.originalGuestsState.find((e) => e.id === element.id);
    return (element as any)[column] !== (a as any)[column];
  }

  applyFilter(): void {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }

  editRow(row: any) {
    this.saveAllValuesForRowIndex(row);
    row.editing = false;
  }

  revertChanges(row: any): void {}

  onCellValueChanged(element: any, column: string, newValue: any) {
    console.log(newValue);

    element[column] = newValue;
  }

  saveAllValuesForRowIndex(row: any) {
    console.log(row);

    const rowData: any = {};
    this.displayedColumns.forEach((col) => {
      let columnName = col === 'actions' ? 'editing' : col;
      rowData[columnName] = row[columnName];
    });

    console.log(`Saving row data to the server...`);
    console.log(rowData);

    row = rowData;
    // const index = this.dataSource.data.indexOf(row);
    // this.dataSource = new MatTableDataSource(users);
    // console.log(index);
    // rowData.phone = 'adddad'

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

    this.selection.select(...this.dataSource.data);
  }
}
