import { Component, OnDestroy } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnDestroy {
  signInForm: FormGroup;
  loading = false;
  isRtl = false;

  private destroy$: Subject<void> = new Subject();

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private languageService: LanguageService
  ) {
    this.signInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.languageService.rtl$.pipe(takeUntil(this.destroy$)).subscribe(rtl => this.isRtl = rtl);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    this.loading = true;
    if (this.signInForm.valid) {
      console.log('Form Submitted:', this.signInForm.value);
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
          } else {
            console.log('error');
          }
        });
    } else {
      console.log('Form is invalid');
    }
  }
}
