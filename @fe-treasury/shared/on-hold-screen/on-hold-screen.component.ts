import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { StoreDataService } from 'src/app/services/store-data.service';
@Component({
  selector: 'on-hold-screen',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './on-hold-screen.component.html',
  styleUrls: ['./on-hold-screen.component.scss'],
})
export class OnHoldScreenComponent {
  logoUrl: SafeHtml | null = null;
  onHoldImg: SafeHtml | null = null;
  isOnboardingRoute: boolean = true;
  isIframe: boolean = false;
  constructor(
    private svgLibrary: SvgLibraryService,
    private router: Router,
    private storeDataService: StoreDataService
  ) {}
  ngOnInit(): void {
    this.logoUrl = this.svgLibrary.getLogo();
    this.svgLibrary.getSvg('coding').subscribe((svgContent) => {
      this.onHoldImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    this.isIframe = this.storeDataService.checkIframe();
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
