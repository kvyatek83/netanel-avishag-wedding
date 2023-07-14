import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

export function NumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (isNaN(value) || value <= 0) {
    return { invalidNumber: 'Number needs to be bigger than 1.' };
  }

  return null;
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

  form = this.fb.group({
    participants: [0, [Validators.required, NumberValidator]],
    transport: [false],
  });

  readonly numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  private userUuid: string | null | undefined;
  private destroy$: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private languageService: LanguageService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));

    this.userUuid = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    if (!this.authService.guestDetails) {
      setTimeout(() => this.initGuestAndWeddingDetails(), 3000);
    } else {
      this.initGuestAndWeddingDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  guestConfirmationStatus(): void {
    console.log(this.form.value);
    // sent to server
    // amount
    // confirmation
  }

  whatsUp(): void {
    this.router.navigate(['/guest/for-your-information']);
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
            if (Number(guestDetails?.participants) > 3) {
              this.form.setValue({participants: Number(guestDetails?.participants), transport: guestDetails.transport})
            }
            this.creatWeddingDetails(wedding);
            this.isLoading = false;
          }
        });
    }
  }

  private creatWeddingDetails(wedding: WeddingDetails): void {
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
}
