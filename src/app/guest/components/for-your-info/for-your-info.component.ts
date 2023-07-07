import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-for-your-info',
  templateUrl: './for-your-info.component.html',
  styleUrls: ['./for-your-info.component.scss']
})
export class ForYourInfoComponent implements OnDestroy {
  isRtl = false;

  private destroy$: Subject<void> = new Subject();

  constructor(private languageService: LanguageService) {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
}
