import { Component } from '@angular/core';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  signInForm: FormGroup;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.signInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
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
