import { Component, EventEmitter, Output } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; // Import AuthService
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
  constructor(
    private svgLibrary: SvgLibraryService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('congrats').subscribe((svgContent) => {
      this.successImg = svgContent; // SafeHtml type to display SVG dynamically
    });
  }
  goToStep() {
    this.authService.logoutUser(); // Call logoutUser, which handles the redirect
  }
}
