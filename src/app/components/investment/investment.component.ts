import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
})
export class InvestmentComponent implements OnInit {
  isMobile = false;
  investmentsFailure: boolean = false;
  isIframe: boolean = false;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router // Inject Router service
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, '(max-width: 1120px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }
  getFailureStatus(status: boolean): void {
    console.log('Failure status: ', status);
    this.investmentsFailure = status;
  }
  retryLoad(): void {
    // Navigate away and back to reload the component
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);
    });
  }
  backToStart(): void {
    this.router.navigate(['/app/home']);
  }
}
