import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import {
  Subject,
  catchError,
  combineLatest,
  of,
  startWith,
  take,
  takeUntil,
} from 'rxjs';
import { AuthService, GuestDetails } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/lang.service';
import { NotificationsService } from 'src/app/services/notifications.service';

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

interface GuestAnswer {
  user: GuestDetails;
  message: string;
}

export function NumberValidator(
  control: AbstractControl
): ValidationErrors | null {
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
  private readonly MAX_GUESTS = 10;
  isRtl = false;
  isLoading = false;
  guest: GuestDetails | undefined;
  calendarLink: string | undefined;
  wazeLink: string | undefined;
  changesMade = false;

  form = this.fb.group({
    participants: [0, [Validators.required, NumberValidator]],
    transport: [false],
  });

  numbers = Array.from({ length: this.MAX_GUESTS }, (_, i) => i + 1);

  private userUuid: string | null | undefined;
  private destroy$: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private languageService: LanguageService,
    private fb: FormBuilder,
    private router: Router,
    private notificationsService: NotificationsService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));

    this.userUuid = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    if (!this.authService.guestDetails) {
      this.subscribeToGuestChanges();
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
    if (this.form.valid) {
      const body = {
        id: this.userUuid,
        confirmation: this.changesMade ? true : !this.guest?.confirmation,
        ...this.form.value,
      };

      this.changesMade = false;
      this.isLoading = true;

      this.http
        .post<GuestAnswer>(`/api/guest/${this.userUuid}/save-the-date`, body)
        .pipe(
          take(1),
          catchError((error) => {
            if (error.status === 404) {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  `notifications.errors.${error.error.message}`,
                  { user: error.error.params }
                ),
              });
            } else if (error.status === 401) {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  `notifications.errors.${error.error.message}`
                ),
              });
            } else {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  'notifications.errors.general'
                ),
              });
            }

            console.error(error);
            this.isLoading = false;
            return of(null);
          })
        )
        .subscribe((res) => {
          if (res) {
            this.notificationsService.setNotification({
              type: 'SUCCESS',
              message: this.translocoService.translate(
                `notifications.success.${res.message}`
              ),
            });

            this.guest = res?.user;
            const participants = Number(this.guest?.participants);

            if (participants > 0) {
              if (participants > this.MAX_GUESTS) {
                this.numbers = Array.from(
                  { length: participants + this.MAX_GUESTS },
                  (_, i) => i + 1
                );
              }
            }

            this.form.setValue({
              participants: participants,
              transport: this.guest?.transport,
            });

            this.isLoading = false;
          }
        });
    } else {
      console.log('Form is invalid!!!');
    }
  }

  whatsUp(): void {
    this.router.navigate(['/guest/for-your-information']);
  }

  private initGuestAndWeddingDetails(): void {
    if (!this.userUuid) {
      this.notificationsService.setNotification({
        type: 'ERROR',
        message: this.translocoService.translate(
          'notifications.errors.missingGuestId'
        ),
      });
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
            if (error.status === 404) {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  `notifications.errors.${error.error.message}`,
                  { user: error.error.params }
                ),
              });
            } else if (error.status === 401) {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  `notifications.errors.${error.error.message}`
                ),
              });
            } else {
              this.notificationsService.setNotification({
                type: 'ERROR',
                message: this.translocoService.translate(
                  'notifications.errors.general'
                ),
              });
            }
            this.isLoading = false;
            return of([null, null]);
          })
        )
        .subscribe(([guestDetails, wedding]) => {
          if (guestDetails && wedding) {
            this.guest = guestDetails;
            this.authService.setGuestDetails(guestDetails);

            const participants = Number(guestDetails?.participants);

            if (participants > 0) {
              if (participants > this.MAX_GUESTS) {
                this.numbers = Array.from(
                  { length: participants + this.MAX_GUESTS },
                  (_, i) => i + 1
                );
              }
            }

            this.form.setValue({
              participants: participants,
              transport: guestDetails.transport,
            });

            this.creatWeddingDetails(wedding);
            this.isLoading = false;
          }
        });
    }
  }

  private subscribeToGuestChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$), startWith(this.form.value))
      .subscribe((value) => {
        if (this.guest?.confirmation) {
          const originalStatus = {
            participants: Number(this.guest.participants),
            transport: this.guest?.transport,
          };
          this.changesMade =
            JSON.stringify(value) !== JSON.stringify(originalStatus);
        }
      });
  }

  private creatWeddingDetails(wedding: WeddingDetails): void {
    const eventDate = new Date(
      wedding.weddingYear,
      wedding.weddingMonth - 1,
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

    if (this.getMobileOS() === 'iOS' || this.getMobileOS() === 'Other') {
      this.wazeLink = `waze://${wedding.wazeLink}`;

    } else if (this.getMobileOS() === 'Android') {
      this.wazeLink = `intent://${wedding.wazeLink}#Intent;scheme=waze;package=com.waze;end;`;
    }
  }

  private getMobileOS(): 'Android' | 'iOS' | 'Other' {
    const userAgent = navigator.userAgent
    if (/android/i.test(userAgent)) {
      return "Android"
    } else if (/iPad|iPhone|iPod/.test(userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      return "iOS"
    }
    return "Other"
  }
}
