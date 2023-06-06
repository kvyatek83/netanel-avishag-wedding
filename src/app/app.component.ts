import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'netanel-avishag-wedding';
  constructor(private http: HttpClient) { 
    this.http.get('/api/hello').subscribe(val => console.log(val))
  }
}
