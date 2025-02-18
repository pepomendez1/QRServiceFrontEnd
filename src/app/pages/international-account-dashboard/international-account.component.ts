import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-international-account',
  templateUrl: './international-account.component.html',
  styleUrl: './international-account.component.scss',
})
export class InternationalAccountComponent implements OnInit {
  accountFailure: boolean = false;
  ngOnInit() {}

  getFailureStatus(status: boolean): void {
    console.log('Failure status: ', status);
    this.accountFailure = status;
  }
}
