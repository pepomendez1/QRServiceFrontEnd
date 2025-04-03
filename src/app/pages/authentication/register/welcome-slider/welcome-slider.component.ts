import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StoreDataService } from 'src/app/services/store-data.service';
import { StorageData } from 'src/app/services/store-data.service';
import { SafeHtml } from '@angular/platform-browser';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { register } from 'swiper/element/bundle';
import { SwiperContainer } from 'swiper/element';

// register Swiper custom elements
register();

const DEFAULT_SLIDES = [
  {
    slideTitle: 'Una cuenta digital exclusiva para tu negocio',
    slideDescription:
      'Transferí a tus contactos y controlá tus movimientos desde un solo lugar.',
  },
  {
    slideTitle: 'La receta perfecta para que tu negocio crezca',
    slideDescription:
      'Manejá tus finanzas mientras tu plata genera rendimientos.',
  },
  {
    slideTitle: 'Incluye tarjetas internacionales sin costo',
    slideDescription:
      'Tenés una tarjeta digital prepaga lista para usar y podés pedir una física cuando quieras',
  },
  {
    slideTitle: '100% gratis, sin trámites presenciales o complicados',
    slideDescription:
      'Creá tu cuenta en minutos y empezá a disfrutar de los beneficios ya.',
  },
];
@Component({
  selector: 'app-welcome-slider',
  templateUrl: './welcome-slider.component.html',
  styleUrls: ['./welcome-slider.component.scss'],
})
export class WelcomeSliderComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  logoUrl: SafeHtml | null = null;
  pagination = true;
  navigation = false;
  showLogo = true;
  primaryColor: string = '';
  setPassword: boolean = false;
  numberOfSlides: any = '4';
  @Input() debugMode: boolean = false;
  @Output() newPassword = new EventEmitter<void>();

  slides: Array<{
    slideTitle: string;
    slideDescription: string;
    slideImage: string;
    safeSlideImage: SafeHtml | null;
  }> = [];

  isLastSlide = false; // Track if it's the last slide
  private swiperInstance: any; // Store the Swiper instance

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

  ngAfterViewInit(): void {
    // Use vanilla JavaScript to initialize Swiper
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      this.swiperInstance = swiperEl.swiper; // Access the Swiper instance

      // Listen for slide changes
      this.swiperInstance.on('slideChange', () => {
        console.log('Slide changed');
        this.onSlideChange();
      });

      console.log('Swiper initialized:', this.swiperInstance);
    } else {
      console.error('Swiper element not found!');
    }
  }

  ngOnDestroy(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true); // Destroy the Swiper instance
      this.swiperInstance = null;
    }
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
      this.slides = this.mergeSlidesWithDefaults(initConfig); // Pass initConfig to mergeSlidesWithDefaults
      this.loadSlideImages(); // Load SVG images for slides
      console.log('slides: ', this.slides);
    });
  }

  private mergeSlidesWithDefaults(
    initConfig: StorageData['init_config']
  ): Array<{
    slideTitle: string;
    slideDescription: string;
    slideImage: string;
    safeSlideImage: SafeHtml | null;
  }> {
    this.numberOfSlides =
      parseInt(this.numberOfSlides, 10) || DEFAULT_SLIDES.length;

    return Array.from({ length: this.numberOfSlides }).map((_, i) => {
      const index = i + 1; // Slide numbers start from 1

      // Use the store values or fallback to DEFAULT_SLIDES
      const slideTitle = String(
        initConfig?.[`slide${index}Title`] ||
          DEFAULT_SLIDES[i]?.slideTitle ||
          ''
      );
      const slideDescription = String(
        initConfig?.[`slide${index}Description`] ||
          DEFAULT_SLIDES[i]?.slideDescription ||
          ''
      );

      return {
        slideTitle,
        slideDescription,
        slideImage: `slide-${index}`, // Always set to `slide-${index}`
        safeSlideImage: null, // Initially null, will be populated later
      };
    });
  }

  private loadSlideImages(): void {
    this.slides.forEach((slide) => {
      const svgName = slide.slideImage; // Use the slideImage value (e.g., 'slide-1', 'slide-2')
      console.log(`Loading SVG: ${svgName}`);
      this.svgLibrary.getSvg(svgName).subscribe(
        (svgContent) => {
          if (svgContent) {
            console.log(`SVG loaded successfully: ${svgName}`);
            slide.safeSlideImage = svgContent; // Assign the preloaded SVG
          } else {
            console.warn(`SVG content is null or undefined for: ${svgName}`);
          }
        },
        (error) => {
          console.error(`Error loading SVG: ${svgName}`, error);
        }
      );
    });
  }

  // Method to handle slide change
  onSlideChange(): void {
    console.log('onSlideChange triggered');
    if (this.swiperInstance) {
      this.isLastSlide = this.swiperInstance.isEnd; // Check if it's the last slide
      console.log('isLastSlide:', this.isLastSlide);
    }
  }

  // Method to handle button click
  onButtonClick(): void {
    console.log('onButtonClick triggered');
    if (this.swiperInstance) {
      console.log('Swiper instance:', this.swiperInstance);
      if (this.isLastSlide) {
        this.goToSetPassword(); // Execute method on last slide
      } else {
        this.swiperInstance.slideNext(); // Navigate to next slide
      }
    } else {
      console.error('Swiper instance is undefined!');
    }
  }

  goToSetPassword(): void {
    console.log('Bienvenido/a!');
    this.newPassword.emit();
  }
}
