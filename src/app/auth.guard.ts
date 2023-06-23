import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // add also for guest?
    const authUser = window.localStorage.getItem('auth-user');
    if (authUser) {
      const token = JSON.parse(authUser);
      if (token) {
        const tokenPayload = JSON.parse(window.atob(token.split('.')[1]));

        if (tokenPayload.role === 'admin') {
          return true;
        }
      }
    }

    // Redirect to login page or any other non-admin page
    this.router.navigate(['/login']);

    return false;
  }
}
