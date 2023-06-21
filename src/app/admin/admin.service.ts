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
}
