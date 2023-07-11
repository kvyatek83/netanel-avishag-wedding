import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, take, tap } from 'rxjs';

export interface WeddingGuest {
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
  deleted?: boolean;
}

// Add user errors

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getAllGuests(): Observable<WeddingGuest[]> {
    return this.http
      .get<WeddingGuest[]>(`/api/admin/get-all-guests`)
      .pipe(take(1));
  }

  downloadDb(): Observable<Blob> {
    return this.http.get<Blob>('/api/admin/download-db', {responseType: 'blob' as 'json'}).pipe(take(1));
  }

  replaceDB(guests: WeddingGuest[]): Observable<WeddingGuest[]> {
    return this.http.post<WeddingGuest[]>('/api/admin/replace-db', {users: guests}).pipe(take(1));
  }

  saveChangesToDB(guests: WeddingGuest[]): Observable<WeddingGuest[]> {
    return this.http.post<WeddingGuest[]>('/api/admin/save-changes-to-db', {users: guests}).pipe(take(1));
  }
}
