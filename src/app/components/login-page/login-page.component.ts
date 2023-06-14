import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { catchError, switchMap, take, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  signInForm: FormGroup;

  
  

 
  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) { 
    this.signInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    // const username = "Netanel Kvyatek";
    // const password = "Nkvyatek83";
    // this.authService.login(username, password)
    // .pipe(take(1))
    // .subscribe(allowed => {
    //   if (allowed) {
    //     this.router.navigate(['/admin']);
    //   } else {
    //     console.log('error');
    //   }
    // });
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      console.log('Form Submitted:', this.signInForm.value);
       // this.authService.login(username, password)
    // .pipe(take(1))
    // .subscribe(allowed => {
    //   if (allowed) {
    //     this.router.navigate(['/admin']);
    //   } else {
    //     console.log('error');
    //   }
    // });
    } else {
      console.log('Form is invalid');
    }
  }
}
