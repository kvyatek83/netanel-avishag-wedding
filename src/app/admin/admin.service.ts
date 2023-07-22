import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';

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

  downloadGuestList(): Observable<Blob> {
    return this.http.get<Blob>('/api/admin/download', {responseType: 'blob' as 'json'}).pipe(take(1));
  }

  replaceDB(guests: WeddingGuest[]): Observable<WeddingGuest[]> {
    return this.http.post<WeddingGuest[]>('/api/admin/replace-db', {users: guests}).pipe(take(1));
  }

  saveChangesToDB(guests: WeddingGuest[]): Observable<WeddingGuest[]> {
    return this.http.post<WeddingGuest[]>('/api/admin/save-changes-to-db', {users: guests}).pipe(take(1));
  }

  sendMessage(message: string, invitation: boolean, users: WeddingGuest[]): Observable<{message: string}> {
    return this.http.post<{message: string}>('/api/admin/send-message', {message, invitation, users}).pipe(take(1));
  }
}
