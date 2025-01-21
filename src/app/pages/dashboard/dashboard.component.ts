import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  treasuryFailure: boolean = false;
  ngOnInit() {}

  getFailureStatus(status: boolean): void {
    console.log('Failure status: ', status);
    this.treasuryFailure = status;
  }
}
