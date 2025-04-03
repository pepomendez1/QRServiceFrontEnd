import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { StoreDataService } from 'src/app/services/store-data.service';

@Component({
  selector: 'app-invalid-token',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invalid-token.component.html',
  styleUrl: './invalid-token.component.scss',
})
export class InvalidTokenComponent {
  @Input() backToStartEnable: boolean = false;
  isIframe: boolean = false;
  problemImg: SafeHtml | null = null;

  constructor(
    private svgLibrary: SvgLibraryService,
    private storeDataService: StoreDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isIframe = this.storeDataService.checkIframe();
    this.svgLibrary.getSvg('invalid-token').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
    });
  }

  retryLoad(): void {
    // Navigate away and back to reload the component
    const currentRoute = this.router.url;
    console.log('ruta actual ', currentRoute);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);
    });
  }
}
