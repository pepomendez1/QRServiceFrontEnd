import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { FaqInvestmentsComponent } from './faq-investments/faq-investments.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { Observable } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
})
export class InvestmentComponent implements OnInit {
  svg: SafeHtml | null = null;
  problemImg: SafeHtml | null = null;
  isMobile = false;
  investmentsFailure: boolean = false;
  constructor(
    private svgLibrary: SvgLibraryService,
    private sidePanelService: SidePanelService,
    private breakpointObserver: BreakpointObserver,
    private router: Router // Inject Router service
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('discount-cupons').subscribe((svgContent) => {
      this.svg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
    });
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

  openFAQPanel() {
    this.sidePanelService.open(
      FaqInvestmentsComponent,
      'Datos de la cuenta',
      {},
      false
    );
  }
}
