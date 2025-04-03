import { Component, EventEmitter, Output } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; // Import AuthService
import { StoreDataService } from 'src/app/services/store-data.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
@Component({
  selector: 'app-end-onb',
  templateUrl: './end-onb-success.component.html',
  styleUrls: ['./end-onb-success.component.scss'],
})
export class EndOnboardingSuccessComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  successImg: SafeHtml | null = null;
  isOnboardingRoute: boolean = true;
  isIframe: boolean = false;
  constructor(
    private svgLibrary: SvgLibraryService,
    private router: Router,
    private storeDataService: StoreDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isIframe = this.storeDataService.checkIframe();

    this.svgLibrary.getSvg('congrats').subscribe((svgContent) => {
      this.successImg = svgContent; // SafeHtml type to display SVG dynamically
    });
  }
  goToStep() {
    if (this.isIframe) {
      this.router.navigate(['/app/home']);
    } else this.authService.logoutUser(); // Call logoutUser, which handles the redirect
  }
}
