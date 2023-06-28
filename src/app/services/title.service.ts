import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translocoService: TranslocoService,
    private authService: AuthService
  ) {}

  init() {
    combineLatest([
      this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      ),
      this.translocoService.selectTranslate('appName'),
      this.authService.guestDetails$
    ])
      .subscribe(([data, appName, guest]) => {
        // const currentPage = data['title'];
        let title
        if (guest) {
          const helloGuest = this.translocoService.translate('hello', { value: guest.hebrewname });
          title = `${appName} | ${helloGuest}`
        } else {
          title = appName;
        }
       

        // const title = currentPage ? currentPage + ' - My App' : 'My App';
        this.titleService.setTitle(title);
      });
  }
}
