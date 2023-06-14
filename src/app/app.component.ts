import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { switchMap, take, tap } from 'rxjs';
import { TitleService } from './services/title.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'netanel-avishag-wedding';
  constructor(private http: HttpClient, private titleService: TitleService, private authService: AuthService, private router: Router) { 
    this.titleService.init();

  //   const username = "Netanel Kvyatek";
  //   const password = "Nkvyatek83";
  //   const a = {
  //     username: "Netanel Kvyatek",
  //     password: "Nkvyatek83"
  // };
    // this.http.get('/api/hello', { responseType: 'text' }).subscribe(val => console.log(val));
    // this.authService.login(username, password)
    // .pipe(take(1))
    // .subscribe(a => {
    //   if (a) {
    //     this.router.navigate(['/admin']);
    //   } else {
    //     console.log('error');
    //   }
    // })
    // this.http.post('/api/login', a).pipe(tap((val: any) => {
    //   console.log(val);
    //   const aaa = val.token.split('.')[1];
    //   const bbb = window.atob(aaa);
    //   const ccc = JSON.parse(bbb);
    //   console.log(ccc);
    //   window.sessionStorage.removeItem('auth-user');
    //   window.sessionStorage.setItem('auth-user', JSON.stringify(val.token));
    // }), switchMap(() => this.http.get('/api/admin', { responseType: 'text' }))).subscribe((val: any) => {
    //   console.log(val);
    // });

    // window.sessionStorage.removeItem('auth-user');
    // window.sessionStorage.setItem('auth-user', JSON.stringify(user));
  }
}
