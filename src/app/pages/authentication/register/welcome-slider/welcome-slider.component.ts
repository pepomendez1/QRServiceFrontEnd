import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StoreDataService } from 'src/app/services/store-data.service';
import { StorageData } from 'src/app/services/store-data.service';
import { SafeHtml } from '@angular/platform-browser';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { register } from 'swiper/element/bundle';

// register Swiper custom elements
register();
const DEFAULT_SLIDES = [
  {
    slideTitle: 'Una cuenta digital exclusiva para tu negocio',
    slideDescription:
      'Transferí a tus contactos y controlá tus movimientos desde un solo lugar.',
    slideImage: '/assets/default-images/welcome-slides/slide-1.svg',
  },
  {
    slideTitle: 'La receta perfecta para que tu negocio crezca',
    slideDescription:
      'Manejá tus finanzas mientras tu plata genera rendimientos.',
    slideImage: '/assets/default-images/welcome-slides/slide-2.svg',
  },
  {
    slideTitle: 'Incluye tarjetas internacionales sin costo',
    slideDescription:
      'Tenés una tarjeta digital prepaga lista para usar y podés pedir una física cuando quieras',
    slideImage: '/assets/default-images/welcome-slides/slide-3.svg',
  },
  {
    slideTitle: '100% gratis, sin trámites presenciales o complicados',
    slideDescription:
      'Creá tu cuenta en minutos y empezá a disfrutar de los beneficios ya.',
    slideImage: '/assets/default-images/welcome-slides/slide-4.svg',
  },
];

@Component({
  selector: 'app-welcome-slider',
  templateUrl: './welcome-slider.component.html',
  styleUrls: ['./welcome-slider.component.scss'],
})
export class WelcomeSliderComponent implements OnInit {
  logoUrl: SafeHtml | null = null;
  pagination = true;
  navigation = false;
  showLogo = true;
  primaryColor: string = '';
  setPassword: boolean = false;
  numberOfSlides: any = '3';
  @Input() debugMode: boolean = false;
  @Output() newPassword = new EventEmitter<void>();

  slides: Array<any> = [];

  constructor(
    private svgLibrary: SvgLibraryService,
    private breakpointObserver: BreakpointObserver,
    private storeDataService: StoreDataService
  ) {}

  ngOnInit(): void {
    this.logoUrl = this.svgLibrary.getLogo();
    console.log('logo URL: ', this.logoUrl);
    this.handleResponsiveView();
    this.loadSlidesFromStore();
  }

  private handleResponsiveView(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        if (result.matches) {
          // Mobile view
          this.showLogo = false;
          this.pagination = true;
          this.navigation = false;
        } else {
          // Desktop view
          this.showLogo = true;
          this.pagination = false;
          this.navigation = true;
        }
      });
  }

  private loadSlidesFromStore(): void {
    this.storeDataService.getStore().subscribe((store: StorageData) => {
      this.primaryColor = store.init_config?.primary_color || '';
      const initConfig = store.init_config;
      console.log('init config: ', initConfig);
      this.slides = this.mergeSlidesWithDefaults(initConfig);
      //this.slides = DEFAULT_SLIDES;
      console.log('slides: ', this.slides);
    });
  }

  private mergeSlidesWithDefaults(
    initConfig: StorageData['init_config']
  ): Array<any> {
    this.numberOfSlides = initConfig?.number_of_slides || DEFAULT_SLIDES.length;

    return Array.from({ length: parseInt(this.numberOfSlides, 10) }).map(
      (_, i) => {
        const index = i + 1; // Slide numbers start from 1
        return {
          slideTitle:
            initConfig?.[`slide${index}Title`] || DEFAULT_SLIDES[i]?.slideTitle,
          slideDescription:
            initConfig?.[`slide${index}Description`] ||
            DEFAULT_SLIDES[i]?.slideDescription,
          slideImage:
            initConfig?.[`slide${index}Image`] || DEFAULT_SLIDES[i]?.slideImage,
        };
      }
    );
  }

  goToSetPassword(): void {
    console.log('Bienvenido/a!');
    this.newPassword.emit();
  }
}
