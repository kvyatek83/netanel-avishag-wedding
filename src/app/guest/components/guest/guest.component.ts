import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-guest',
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.scss']
})
export class GuestComponent implements OnInit {
  username = 'error'

  eventName: string = 'wedding';
  eventDate: Date = new Date(2023, 10, 10, 18, 0)

  eventDuration: number = 360; // in minutes
   eventDetails: string = 'Our wedding';
  eventLocation: string = 'Atura';

  calendarLink: string | undefined;
  weddingPlace = '%D7%90%D7%98%D7%95%D7%A8%D7%94%20-%20%D7%91%D7%99%D7%AA%20%D7%9C%D7%90%D7%A8%D7%95%D7%A2%D7%99%D7%9D';
  wazeLink = `https://www.waze.com/ul?q=${this.weddingPlace}&navigate=yes`;

  private userUuid: string | null | undefined;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.userUuid = this.route.snapshot.paramMap.get('id');
    this.generateCalendarLink();

    if (!this.userUuid) {
      console.log('error');
    } else {

      this.http.get(`/api/guest/${this.userUuid}`, { responseType: 'text' }).pipe(take(1)).subscribe((user: string) => {
        this.username = user;
      })
    }

    // init wedding details
  }

  


  generateCalendarLink(): void {
    const startDate = this.eventDate?.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(this.eventDate.getTime() + this.eventDuration * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');

    this.calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      this.eventName || ''
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      this.eventDetails || ''
    )}&location=${encodeURIComponent(this.eventLocation || '')}`;
    
  }

  navToWedding(): void {

  }

  guestConfirmationStatus(): void {
    // amount
    // confirmation
  }

  addToCalen(): void {
    
  }
}
