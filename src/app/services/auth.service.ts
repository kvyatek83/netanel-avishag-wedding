import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';

interface AuthResponse {
  auth: boolean;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>('/api/login', {username, password}).pipe(
      tap((authResponse: AuthResponse) => {
        window.localStorage.removeItem('auth-user');
        window.localStorage.setItem('auth-user', JSON.stringify(authResponse.token));

        // console.log(authResponse);
        // const aaa = authResponse.token.split('.')[1];
        // const bbb = window.atob(aaa);
        // const ccc = JSON.parse(bbb);
        // console.log(ccc);
        // window.sessionStorage.removeItem('auth-user');
        // window.sessionStorage.setItem('auth-user', JSON.stringify(authResponse.token));
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

  getCurrentUserName(): string {
    // save user on login and return name by lang
    return 'dadad'
  }
}
