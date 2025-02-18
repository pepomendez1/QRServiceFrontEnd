import { Component } from '@angular/core';

@Component({
  selector: 'app-insurance-dashboard',
  templateUrl: './insurance-dashboard.component.html',
  styleUrl: './insurance-dashboard.component.scss',
})
export class InsuranceDashboardComponent {
  accountFailure: boolean = false;
  isLoading: boolean = false;
  ngOnInit() {}

  getFailureStatus(status: boolean): void {
    console.log('Failure status: ', status);
    this.accountFailure = status;
  }
  contractInsurance(): void {}
  OpenInsuranceFAQ(): void {}
}
