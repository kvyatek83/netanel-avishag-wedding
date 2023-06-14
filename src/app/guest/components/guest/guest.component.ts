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
  private userUuid: string | null | undefined;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.userUuid = this.route.snapshot.paramMap.get('id');

    if (!this.userUuid) {
      console.log('error');
    } else {
      this.http.get(`/api/guest/${this.userUuid}`, { responseType: 'text' }).pipe(take(1)).subscribe((user: string) => {
        this.username = user;
      })
    }

    // init wedding details
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
