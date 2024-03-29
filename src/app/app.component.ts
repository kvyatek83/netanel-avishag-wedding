import { Component } from '@angular/core';
import { TitleService } from './services/title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'netanel-avishag-wedding';
  constructor(private titleService: TitleService) { 
    this.titleService.init();
  }
}
