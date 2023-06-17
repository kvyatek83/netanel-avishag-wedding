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
  wazeLink = 'https://waze.com/ul?q=1600%20Amphitheatre%20Parkway,%20Mountain%20View,%20CA';

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
