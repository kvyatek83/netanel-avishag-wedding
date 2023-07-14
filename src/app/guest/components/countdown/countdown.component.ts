import { Component, OnDestroy } from '@angular/core';
import { Subject, interval, takeUntil } from 'rxjs';
import { LanguageService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnDestroy {
  weAreMarried = false;

  public dateNow = new Date();
  public dDay = new Date('Oct 10 2023 18:00:00');
  milliSecondsInASecond = 1000;
  hoursInADay = 24;
  minutesInAnHour = 60;
  SecondsInAMinute = 60;

  public timeDifference: number | undefined;
  public secondsToDday: number | undefined;
  public minutesToDday: number | undefined;
  public hoursToDday: number | undefined;
  public daysToDday: number | undefined;

  isRtl = false;

  private destroy$: Subject<void> = new Subject();

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
    this.getTimeDifference();
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getTimeDifference());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTimeDifference(): void {
    this.timeDifference = this.dDay.getTime() - new Date().getTime();
    this.allocateTimeUnits(this.timeDifference);
  }

  private allocateTimeUnits(timeDifference: number): void {
    this.secondsToDday = this.setValue(Math.floor(
      (timeDifference / this.milliSecondsInASecond) % this.SecondsInAMinute
    ));
    this.minutesToDday = this.setValue(Math.floor(
      (timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour)) %
        this.SecondsInAMinute
    ));
    this.hoursToDday = this.setValue(Math.floor(
      (timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute)) %
        this.hoursInADay
    ));
    this.daysToDday = this.setValue(Math.floor(
      timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute *
          this.hoursInADay)
    ));
  }

  private setValue(time: number): number {
    return time > 0 ? time : 0;
  }
}
