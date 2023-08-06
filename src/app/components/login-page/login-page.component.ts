import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Subject,
  Subscription,
  map,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from 'src/app/services/lang.service';
import { PlatformService } from 'src/app/services/platform.sevice';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  animations: [
    trigger('fade', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible <=> hidden', animate('0.5s ease-in-out')),
    ]),
  ],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private readonly BASE_PATH = './assets';
  private readonly LARGE_BG = './large-login-background.png';
  private readonly MEDIUM_BG = './medium-login-background.png';
  private readonly SMALL_BG = './small-login-background.png';
  private readonly MOBILE_BG = './mobile-login-background';

  signInForm: FormGroup;
  loading = false;
  isRtl = false;
  isMobile = false;
  backgroundImage: string | undefined;

  private destroy$: Subject<void> = new Subject();
  fade$: Subject<boolean> = new Subject();
  mobileTimer: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private languageService: LanguageService,
    private platformService: PlatformService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.signInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.platformService.isMobile$.pipe(takeUntil(this.destroy$)).subscribe(mobile => this.isMobile = mobile);
    }, 500)

    this.platformService.breakpoint$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.mobileTimer) {
          this.mobileTimer.unsubscribe();
          this.mobileTimer = undefined;
        }

        if (this.breakpointObserver.isMatched(Breakpoints.Large)) {
          this.backgroundImage = `${this.BASE_PATH}/${this.LARGE_BG}`;
        } else if (this.breakpointObserver.isMatched(Breakpoints.Medium)) {
          this.backgroundImage = `${this.BASE_PATH}/${this.MEDIUM_BG}`;
        } else if (this.breakpointObserver.isMatched(Breakpoints.Small)) {
          this.backgroundImage = `${this.BASE_PATH}/${this.SMALL_BG}`;
        } else if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
          this.mobileTimer = timer(0, 6000)
            .pipe(
              map((tike) => (tike % 3) + 1),
              takeUntil(this.destroy$)
            )
            .subscribe((imageNumber) => {
              this.fade$.next(true);

              setTimeout(() => {
                this.fade$.next(false);
                this.backgroundImage = `${this.BASE_PATH}/${this.MOBILE_BG}-${imageNumber}.png`;
              }, 500);
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.loading = true;
      this.authService
        .login(
          this.signInForm.get('username')?.value,
          this.signInForm.get('password')?.value
        )
        .pipe(take(1))
        .subscribe((allowed) => {
          this.loading = false;

          if (allowed) {
            this.router.navigate(['/admin']);
          }
        });
    } else {
      console.error('Form is invalid');
    }
  }
}
