import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject, Observable } from 'rxjs';

export type LanguageType = 'en' | 'he';
type LanguageDirection = 'rtl' | 'ltr';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly languageMap = new Map<LanguageType, LanguageDirection>([
    ['en', 'ltr'],
    ['he', 'rtl'],
  ]);
  private _rtl$ = new BehaviorSubject<boolean>(false);

  get rtl$(): Observable<boolean> {
    return this._rtl$.asObservable();
  }
  constructor(private translocoService: TranslocoService) {
    // translocoService.load('en').subscribe();
    this.translocoService.langChanges$.subscribe((lang) => {
        const langDirection = this.languageMap.get(lang as LanguageType);
        this._rtl$.next(langDirection === 'rtl');
    });
  }

  getActiveLanguage(): LanguageType {
    return this.translocoService.getActiveLang() as LanguageType;
  }
}
