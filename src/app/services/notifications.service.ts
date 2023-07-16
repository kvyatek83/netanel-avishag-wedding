import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
    type: NotificationType;
    message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  
  private _notification$ = new BehaviorSubject<Notification | null>(null);

  get notification$(): Observable<Notification | null> {
    return this._notification$.asObservable();
  }

  setNotification(notification: Notification | null): void {
    this._notification$.next(notification);
  }
}
