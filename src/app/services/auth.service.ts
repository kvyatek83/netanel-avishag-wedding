import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

interface AuthResponse {
  auth: boolean;
  token: string;
}

export interface GuestDetails {
  confirmation: boolean;
  email?: string;
  hebrewname: string;
  id: string;
  participants: string;
  phone: string;
  transport: boolean;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _guestDetails$ = new BehaviorSubject<GuestDetails | null>(null);

  get guestDetails$(): Observable<GuestDetails | null> {
    return this._guestDetails$.asObservable();
  }

  get guestDetails(): GuestDetails | null {
    return this._guestDetails$.value;
  }

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>('/api/login', {username, password}).pipe(
      tap((authResponse: AuthResponse) => {
        window.localStorage.removeItem('auth-user');
        window.localStorage.setItem('auth-user', JSON.stringify(authResponse.token));
      }),
      map((authResponse: AuthResponse) => {
        return authResponse.auth;
      }),
      catchError(error => {
        console.log(error);
        return of(false);
      })
    );
  }

  getUserRole(): string {
    return ''
  }

  setGuestDetails(guestDetails: GuestDetails): void {
    this._guestDetails$.next(guestDetails);
  }
}
