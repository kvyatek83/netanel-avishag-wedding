import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { NotificationType } from '../services/notifications.service';

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

export interface MessagesRes {
  status: NotificationType;
  messages: string;
  params: { sent: number; failed: number };
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
    return this.http
      .get<Blob>('/api/admin/download-db', { responseType: 'blob' as 'json' })
      .pipe(take(1));
  }

  downloadGuestList(): Observable<Blob> {
    return this.http
      .get<Blob>('/api/admin/download', { responseType: 'blob' as 'json' })
      .pipe(take(1));
  }

  replaceDB(guests: WeddingGuest[]): Observable<WeddingGuest[]> {
    return this.http
      .post<WeddingGuest[]>('/api/admin/replace-db', { users: guests })
      .pipe(take(1));
  }

  saveChangesToDB(guests: WeddingGuest[]): Observable<WeddingGuest[]> {
    return this.http
      .post<WeddingGuest[]>('/api/admin/save-changes-to-db', { users: guests })
      .pipe(take(1));
  }

  sendMessage(
    message: string,
    invitation: boolean,
    users: WeddingGuest[]
  ): Observable<MessagesRes> {
    return this.http
      .post<MessagesRes>('/api/admin/send-message', {
        message,
        invitation,
        users,
      })
      .pipe(take(1));
  }

  getBotStatus(): Observable<boolean> {
    return this.http
      .get<boolean>('/api/admin/bot-status');
  }

  getBotQrCode(): Observable<string> {
    return this.http
      .get('/api/admin/bot-qr', {responseType: 'text'}
      )
      .pipe(take(1));
  }

  downloadGuestMessages(): Observable<Blob> {
    return this.http
      .get<Blob>('/api/admin/download-all-guests-messages', { responseType: 'blob' as 'json' })
      .pipe(take(1));
  }
}
