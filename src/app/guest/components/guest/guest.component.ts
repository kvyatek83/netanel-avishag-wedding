import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, combineLatest, of, take, takeUntil } from 'rxjs';
import { AuthService, GuestDetails } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/lang.service';

interface WeddingDetails {
  wazeLink: string;
  eventName: string;
  weddingYear: number;
  weddingMonth: number;
  weddingDay: number;
  weddingHour: number;
  weddingMinute: number;
  weddingDuration: number;
  weddingDetails: string;
  weddingLocation: string;
}

@Component({
  selector: 'app-guest',
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.scss'],
})
export class GuestComponent implements OnInit, OnDestroy {
  isRtl = false;
  isLoading = false;
  guest: GuestDetails | undefined;
  calendarLink: string | undefined;
  wazeLink: string | undefined;

  // filterValue = new FormControl(1);

  private userUuid: string | null | undefined;
  private destroy$: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
    this.userUuid = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;

    setTimeout(() => this.initGuestAndWeddingDetails(), 3000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initGuestAndWeddingDetails(): void {
    if (!this.userUuid) {
      console.log('error');
      this.isLoading = false;
    } else {
      combineLatest([
        this.http.get<GuestDetails>(`/api/guest/${this.userUuid}`),
        this.http.get<WeddingDetails>(
          `/api/guest/${this.userUuid}/wedding-details`
        ),
      ])
        .pipe(
          take(1),
          catchError((error) => {
            if (error.status === 400) {
              // Display error for user -> please use the givin link to enter
            } else if (error.status === 404) {
              // Dispaly error for user -> are you sure the you pressed the currect link? try again
            }
            this.isLoading = false;
            return of([null, null]);
          })
        )
        .subscribe(([guestDetails, wedding]) => {
          if (guestDetails && wedding) {
            this.guest = guestDetails;
            this.authService.setGuestDetails(guestDetails);

            this.creatWeddingDetails(wedding);
            this.isLoading = false;
          }
        });
    }
  }

  creatWeddingDetails(wedding: WeddingDetails): void {
    const eventDate = new Date(
      wedding.weddingYear,
      wedding.weddingMonth,
      wedding.weddingDay,
      wedding.weddingHour,
      wedding.weddingMinute
    );
    const startDate = eventDate?.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(
      eventDate.getTime() + wedding.weddingDuration * 60 * 1000
    )
      .toISOString()
      .replace(/-|:|\.\d+/g, '');

    this.calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      wedding.eventName || ''
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      wedding.weddingDetails || ''
    )}&location=${encodeURIComponent(wedding.weddingLocation || '')}`;

    this.wazeLink = wedding.wazeLink;
  }

  guestConfirmationStatus(): void {
    // amount
    // confirmation
  }
}
