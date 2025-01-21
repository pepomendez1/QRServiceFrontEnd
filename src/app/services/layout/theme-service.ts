import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { StoreDataService } from '../store-data.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export type Theme = '' | 'app-default' | 'app-dark' | 'app-light';

export interface ThemeConfig {
  navigation: 'side' | 'top';
  sidenavUserVisible: boolean;
  toolbarVisible: boolean;
  toolbarPosition: 'static';
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private _themeSubject = new BehaviorSubject<[Theme, Theme]>([
    '',
    'app-default',
  ]);
  theme$ = this._themeSubject.asObservable();
  activeTheme$ = this.theme$.pipe(map((theme) => theme[1]));
  private barChartColor: any = '#8FB3E9';

  constructor(
    private rendererFactory: RendererFactory2,
    private storeService: StoreDataService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    // Watch for changes in the partner's configuration
    this.storeService.getStore().subscribe((config) => {
      const initConfig = config.init_config; // Access the init_config object
      console.log('primary color : ', initConfig?.primary_color);
      console.log('accent color : ', initConfig?.accent_color);
      if (initConfig?.bar_chart_color) {
        this.barChartColor = initConfig?.bar_chart_color;
      }
      if (initConfig?.primary_color) {
        this.updatePrimaryColor(initConfig.primary_color);
      }

      if (initConfig?.accent_color) {
        this.updateAccentColor(initConfig.accent_color);
      }
    });
  }

  updatePrimaryColor(primaryColor: string): void {
    const root = document.documentElement;

    // Determine if dark mode should be used based on contrast
    const isDarkMode = this.checkContrast(primaryColor, '#FFFFFF') < 4.2; // WCAG threshold
    const theme = isDarkMode ? 'dark' : 'default';

    // Apply the calculated theme
    this.setStyle(theme);
    console.log('theme after contrast check for primary color: ', theme);

    // Set primary color properties
    this.setColorProperties(root, '--primary-color', primaryColor);
  }

  updateAccentColor(accentColor: string): void {
    const root = document.documentElement;

    // Set accent color properties
    this.setColorProperties(root, '--accent-color', accentColor);
  }

  private getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex).split(', ').map(Number);
    return rgb
      .map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      })
      .reduce((lum, val, i) => lum + val * [0.2126, 0.7152, 0.0722][i], 0);
  }

  // Utility function to lighten or darken a color
  lightenDarkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  hexToRgb(hex: string): string {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
  }
  setTheme(theme: Theme) {
    this._themeSubject.next([this._themeSubject.getValue()[1], theme]);
  }

  /**
   * Updates the document title and favicon dynamically.
   */
  updateHeadContent(): void {
    console.log('setting title and favicon...');
    this.storeService.getStore().subscribe((store) => {
      const initConfig = store.init_config;
      console.log('favicon ', initConfig?.favicon_url);
      console.log('title ', initConfig?.web_title);
      if (initConfig) {
        // Update the title
        if (initConfig.web_title) {
          this.renderer.setProperty(document, 'title', initConfig.web_title);
        }

        // Update the favicon
        if (initConfig.favicon_url) {
          const link =
            document.querySelector("link[rel*='icon']") ||
            this.renderer.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'icon';
          link.href = initConfig.favicon_url;

          if (!link.parentNode) {
            this.renderer.appendChild(document.head, link);
          }
        }
      }
    });
  }

  private _configSubject = new BehaviorSubject<ThemeConfig>({
    navigation: 'side',
    sidenavUserVisible: true,
    toolbarVisible: true,
    toolbarPosition: 'static',
  });

  config$ = this._configSubject.asObservable();

  setNavigation(navigation: 'side' | 'top') {
    this._configSubject.next({
      ...this._configSubject.getValue(),
      navigation,
    });
  }

  setSidenavUserVisible(sidenavUserVisible: boolean) {
    this._configSubject.next({
      ...this._configSubject.getValue(),
      sidenavUserVisible,
    });
  }
  setToolbarVisible(toolbarVisible: boolean) {
    this._configSubject.next({
      ...this._configSubject.getValue(),
      toolbarVisible,
    });
  }

  setStyle(style: 'default' | 'dark' | 'light' | 'top') {
    switch (style) {
      case 'dark': {
        this.setTheme('app-dark');
        break;
      }

      case 'light': {
        this._configSubject.next({
          navigation: 'side',
          sidenavUserVisible: false,
          toolbarVisible: true,
          toolbarPosition: 'static',
        });

        this.setTheme('app-light');
        break;
      }

      case 'top': {
        this._configSubject.next({
          navigation: 'top',
          sidenavUserVisible: false,
          toolbarVisible: true,
          toolbarPosition: 'static',
        });
        break;
      }
      default: {
        this.setTheme('app-default'); // Ensure default theme is set
        break;
      }
    }
  }

  private setColorProperties(
    root: HTMLElement,
    basePropertyName: string,
    color: string
  ): void {
    // Base color
    root.style.setProperty(`${basePropertyName}`, color);

    // RGB value
    const rgbColor = this.hexToRgb(color); // Convert HEX to RGB
    root.style.setProperty(`${basePropertyName}-rgb`, rgbColor);

    // Lighter and darker shades
    root.style.setProperty(
      `${basePropertyName}-100`,
      this.lightenDarkenColor(color, 90)
    );
    root.style.setProperty(`${basePropertyName}-200`, color); // Base color
    root.style.setProperty(
      `${basePropertyName}-300`,
      this.lightenDarkenColor(color, -10)
    );
    root.style.setProperty(
      `${basePropertyName}-400`,
      this.lightenDarkenColor(color, -15)
    );
    root.style.setProperty(
      `${basePropertyName}-500`,
      this.lightenDarkenColor(color, -20)
    );
    root.style.setProperty(
      `${basePropertyName}-600`,
      this.lightenDarkenColor(color, -27)
    );
    root.style.setProperty(
      `${basePropertyName}-700`,
      this.lightenDarkenColor(color, -30)
    );
    root.style.setProperty(
      `${basePropertyName}-800`,
      this.lightenDarkenColor(color, -35)
    );
    root.style.setProperty(
      `${basePropertyName}-900`,
      this.lightenDarkenColor(color, -45)
    );
  }

  getCurrentTheme(): 'app-dark' | 'app-default' | null {
    const body = document.body;
    if (body.classList.contains('app-dark')) {
      return 'app-dark';
    } else if (body.classList.contains('app-default')) {
      return 'app-default';
    }
    return null; // No theme detected
  }

  // Utility function to calculate contrast
  checkContrast(hex1: string, hex2: string): number {
    const lum1 = this.getLuminance(hex1);
    const lum2 = this.getLuminance(hex2);
    return lum1 > lum2
      ? (lum1 + 0.05) / (lum2 + 0.05)
      : (lum2 + 0.05) / (lum1 + 0.05);
  }

  getDynamicLogo(isDarkMode: boolean, primaryColor: string | null): string {
    const defaultLogo = `
      <svg
  viewBox="0 0 200 50"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:svg="http://www.w3.org/2000/svg">
  <g id="layer1">
    <text
      x="10"
      y="30"
      style="font-size:24px; font-family:Tahoma; fill:#000;">
      <tspan style="fill:#1c1b1f" id="tspan2">Cuenta</tspan>
      <tspan style="font-weight:bold; font-family:Calibri;" id="tspan3"> </tspan>
      <tspan style="fill:#507cdd" id="tspan4">Digital</tspan>
    </text>
  </g>
</svg>
    `;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(defaultLogo, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    // Check if the SVG element exists
    if (!svgElement) {
      console.error('SVG element not found in the provided default logo.');
      return defaultLogo; // Return the default logo string as a fallback
    }

    if (primaryColor) {
      const tspanCuenta = svgDoc.querySelector('#tspan2'); // "Cuenta"
      const tspanDigital = svgDoc.querySelector('#tspan4'); // "Digital"

      if (isDarkMode) {
        // Dark mode adjustments
        if (tspanCuenta) {
          tspanCuenta.setAttribute('style', 'fill:#ffffff'); // Set "Cuenta" to white
        }
        if (tspanDigital) {
          tspanDigital.setAttribute('style', `fill:${primaryColor}`); // Set "Digital" to primary color
        }
      } else {
        // Light mode adjustments
        if (tspanCuenta) {
          tspanCuenta.setAttribute('style', 'fill:#1c1b1f'); // Default dark fill for "Cuenta"
        }
        if (tspanDigital) {
          tspanDigital.setAttribute('style', `fill:${primaryColor}`); // Set "Digital" to primary color
        }
      }
    }

    // Serialize the modified SVG back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  }
}
