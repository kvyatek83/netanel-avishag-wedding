import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { TranslocoService } from '@ngneat/transloco';

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

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private translocoService: TranslocoService
  ) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>('/api/login', { username, password })
      .pipe(
        tap((authResponse: AuthResponse) => {
          window.localStorage.removeItem('auth-user');
          window.localStorage.setItem(
            'auth-user',
            JSON.stringify(authResponse.token)
          );
        }),
        map((authResponse: AuthResponse) => {
          return authResponse.auth;
        }),
        catchError((error) => {
          if (error.status === 404) {
          this.notificationsService.setNotification({
            type: 'ERROR',
            message: this.translocoService.translate(`notifications.errors.${error.error.message}`, { user: error.error.params }),
          });
          } else if (error.status === 401) {
          this.notificationsService.setNotification({
            type: 'ERROR',
            message: this.translocoService.translate(`notifications.errors.${error.error.message}`, { user: error.error.params }),
          });
          } else {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translocoService.translate('notifications.errors.general'),
            });
          }
          
          console.error(error);
          return of(false);
        })
      );
  }


  setGuestDetails(guestDetails: GuestDetails): void {
    this._guestDetails$.next(guestDetails);
  }
}
