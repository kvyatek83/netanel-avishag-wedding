import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, distinctUntilChanged, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  _isMobile$ = new BehaviorSubject<boolean>(false);

  get isMobile$(): Observable<boolean> {
    return this._isMobile$.asObservable();
  }

  get isMobile(): boolean {
    return this._isMobile$.value;
  }

  readonly breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall])
    .pipe(
      distinctUntilChanged()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe(['(max-width: 760px)'])
      .subscribe((result: BreakpointState) => {
        this._isMobile$.next(result.matches)
      });
  }
}
