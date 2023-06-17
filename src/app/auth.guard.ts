import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // add also for guest?
      const token = JSON.parse(window.localStorage.getItem('auth-user') || '');
      if (token) {
        const tokenPayload = JSON.parse(window.atob(token.split('.')[1]));
  
        if (tokenPayload.role === 'admin') {
          return true;
        }
      }
  
      // Redirect to login page or any other non-admin page
      this.router.navigate(['/login']);
      
      return false;
    }
}
