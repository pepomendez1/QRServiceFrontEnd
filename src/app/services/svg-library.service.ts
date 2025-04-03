import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StoreDataService } from './store-data.service';
import { ThemeService } from './layout/theme-service';

@Injectable({
  providedIn: 'root',
})
export class SvgLibraryService {
  private basePath = 'assets/default-images'; // Path to your SVGs folder
  private preloadedSvgs: Map<string, SafeHtml> = new Map(); // Cache for preloaded sanitized SVGs
  private preloadedPrimaryLogo: SafeHtml | null = null; // Cache for primary logo
  private preloadedContrastLogo: SafeHtml | null = null; // Cache for contrast logo
  private currentLogoSubject = new BehaviorSubject<SafeHtml | null>(null);
  currentLogo$: Observable<SafeHtml | null> =
    this.currentLogoSubject.asObservable(); // Public observable

  constructor(
    private themeService: ThemeService,
    private http: HttpClient,
    private storeService: StoreDataService,
    private sanitizer: DomSanitizer
  ) {
    // Subscribe to theme changes and update the current logo
    this.themeService.activeTheme$.subscribe(() => {
      this.updateCurrentLogo();
    });
  }

  /**
   * Preloads multiple SVGs and applies colors to their paths.
   * @param svgNames Array of SVG file names (without extension).
   * @param primaryColor The color to apply to the first path.
   * @param strokeColor The color to apply to the second path.
   * @returns Observable that resolves when all SVGs are preloaded.
   */
  preloadSvgs(
    svgNames: string[],
    primaryColor: string,
    strokeColor: string = '#4D4D4D',
    customUrls?: { [key: string]: string }
  ): Observable<void> {
    const requests = svgNames.map((svgName) => {
      // Determine the SVG URL (custom or default)
      const isCustom = !!customUrls?.[svgName];
      const svgUrl = isCustom
        ? customUrls[svgName]
        : `${this.basePath}/${svgName}.svg`;

      return this.http.get(svgUrl, { responseType: 'text' }).pipe(
        map((svgContent) => {
          if (!isCustom) {
            // Apply colors only for non-custom SVGs
            svgContent = this.applyColorsToPaths(
              svgContent,
              primaryColor,
              strokeColor
            );
          }
          const sanitizedSvg =
            this.sanitizer.bypassSecurityTrustHtml(svgContent);
          this.preloadedSvgs.set(svgName, sanitizedSvg); // Cache the sanitized SVG
        }),
        catchError((error) => {
          console.error(`Error loading SVG: ${svgName} from ${svgUrl}`, error);
          return of(null); // Graceful fallback
        })
      );
    });

    return forkJoin(requests).pipe(map(() => {})); // Complete when all SVGs are preloaded
  }

  preloadLogos(
    primaryLogoUrl: string,
    contrastLogoUrl?: string
  ): Observable<void> {
    const primaryLogo$ = this.preloadLogo(primaryLogoUrl).pipe(
      map((logo) => {
        this.preloadedPrimaryLogo = logo;
      })
    );

    const contrastLogo$ = contrastLogoUrl
      ? this.preloadLogo(contrastLogoUrl).pipe(
          map((logo) => {
            this.preloadedContrastLogo = logo;
          })
        )
      : of(undefined); // No contrast logo provided

    return forkJoin([primaryLogo$, contrastLogo$]).pipe(
      map(() => {
        this.updateCurrentLogo(); // Update the logo after preloading
      })
    );
  }

  /**
   * Preloads the logo SVG from the provided URL.
   * @param logoUrl URL of the logo SVG.
   * @returns Observable<void> that resolves when the logo is preloaded.
   */
  private preloadLogo(logoUrl: string): Observable<SafeHtml> {
    if (logoUrl.startsWith('<svg')) {
      const sanitizedSvg = logoUrl
        .replace(/width="\d+"/, 'width="100%"') // Replace width with 100%
        .replace(/height="\d+"/, 'height="100%"'); // Replace height with 100%
      const sanitizedLogo =
        this.sanitizer.bypassSecurityTrustHtml(sanitizedSvg);
      return of(sanitizedLogo); // Return as observable
    } else {
      return this.http.get(logoUrl, { responseType: 'text' }).pipe(
        map((svgContent) => {
          const sanitizedSvg = svgContent
            .replace(/width="\d+"/, 'width="100%"')
            .replace(/height="\d+"/, 'height="100%"');
          return this.sanitizer.bypassSecurityTrustHtml(sanitizedSvg);
        }),
        catchError((error) => {
          console.error(`Error loading logo: ${logoUrl}`, error);
          return of(this.sanitizer.bypassSecurityTrustHtml('<svg></svg>')); // Fallback
        })
      );
    }
  }

  /**
   * Retrieves an SVG by name, either from cache or loads it dynamically.
   * @param svgName Name of the SVG file (without extension).
   * @param primaryColor Optional. The color to apply to the first path (defaults to store's primary color).
   * @param strokeColor Optional. The color to apply to the second path (defaults to a fallback).
   * @returns Observable of the SVG content.
   */
  getSvg(
    svgName: string,
    primaryColor?: string,
    strokeColor: string = '#4D4D4D'
  ): Observable<SafeHtml> {
    // Check if the SVG is already preloaded
    if (this.preloadedSvgs.has(svgName)) {
      return of(this.preloadedSvgs.get(svgName)!);
    }

    // Fetch primary color from the store if not provided
    const color$ = primaryColor
      ? of(primaryColor)
      : this.storeService.getStore().pipe(
          map((store) => store.init_config?.primary_color || '#F50050') // Default to black if not set
        );

    // Load the SVG dynamically
    return color$.pipe(
      switchMap((resolvedPrimaryColor) =>
        this.http
          .get(`${this.basePath}/${svgName}.svg`, { responseType: 'text' })
          .pipe(
            map((svgContent) => {
              svgContent = this.applyColorsToPaths(
                svgContent,
                resolvedPrimaryColor,
                strokeColor
              );
              const sanitizedSvg =
                this.sanitizer.bypassSecurityTrustHtml(svgContent);
              this.preloadedSvgs.set(svgName, sanitizedSvg); // Cache the dynamically loaded SVG
              return sanitizedSvg;
            }),
            catchError((error) => {
              console.error(`Error loading SVG dynamically: ${svgName}`, error);
              return of(this.sanitizer.bypassSecurityTrustHtml('<svg></svg>')); // Return an empty sanitized SVG on error
            })
          )
      )
    );
  }

  /**
   * Retrieves the preloaded logo.
   * @returns The sanitized logo as SafeHtml.
   */
  getLogo(): SafeHtml | null {
    const body = document.body;
    const isDarkMode = body.classList.contains('app-dark'); // Check current theme

    const selectedLogo = isDarkMode
      ? this.preloadedContrastLogo
      : this.preloadedPrimaryLogo;

    // console.log('Current Theme:', isDarkMode ? 'Dark' : 'Light');
    // console.log('Selected Logo:', selectedLogo);

    return selectedLogo;
  }

  private updateCurrentLogo(): void {
    const newLogo = this.getLogo(); // Fetch the correct logo based on the current theme
    this.currentLogoSubject.next(newLogo); // Emit the new logo
  }

  /**
   * Applies colors to the first and second paths of an SVG.
   * @param svgContent The original SVG content as a string.
   * @param primaryColor The color to apply to the first path.
   * @param secondaryColor The color to apply to the second path.
   * @returns The modified SVG as a string.
   */
  private applyColorsToPaths(
    svgContent: string,
    primaryColor: string,
    strokeColor: string
  ): string {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

    // Select all elements with the 'fill' attribute
    const elementsWithFill = svgDoc.querySelectorAll('[fill]');

    elementsWithFill.forEach((element) => {
      const fillValue = element.getAttribute('fill');

      // Replace specific colors with the provided primaryColor and strokeColor
      if (fillValue === '#F50050') {
        element.setAttribute('fill', primaryColor);
      } else if (fillValue === '#4D4D4D') {
        element.setAttribute('fill', strokeColor);
      }
    });

    // Serialize the updated SVG back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDoc);
  }

  preloadInlineSvg(inlineSvg: string): Observable<void> {
    return new Observable((observer) => {
      try {
        const sanitizedSvg = inlineSvg
          .replace(/width="\d+"/, 'width="100%"') // Replace width with 100%
          .replace(/height="\d+"/, 'height="100%"'); // Replace height with 100%

        this.preloadedPrimaryLogo =
          this.sanitizer.bypassSecurityTrustHtml(sanitizedSvg); // Cache the sanitized SVG
        //console.log('Inline SVG preloaded successfully.');
        observer.next();
        observer.complete();
      } catch (error) {
        console.error('Error preloading inline SVG:', error);
        observer.error(error);
      }
    });
  }

  getCurrentTheme(): 'dark' | 'light' {
    const body = document.body;
    if (body.classList.contains('app-dark')) {
      return 'dark';
    }
    return 'light';
  }
}
