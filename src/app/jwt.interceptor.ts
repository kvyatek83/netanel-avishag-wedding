import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
const TOKEN_HEADER_KEY = 'authorization';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add also for guest
    if (!req.url.includes('admin')) {
        return next.handle(req);
    } 

    var authReq = req;
    const token = JSON.parse(window.localStorage.getItem('auth-user') || '');
    
    if (token) {
        authReq = req.clone({headers: req.headers.set(TOKEN_HEADER_KEY, token)})
    }
    
    return next.handle(authReq);
  }
}