import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();

@Component({
  selector: 'app-auth-wrapper',
  templateUrl: './auth-wrapper.component.html',
  styleUrls: ['./auth-wrapper.component.scss'],
})
export class AuthWrapperComponent implements OnInit {
  // isTempPassword: boolean = false;
  // needNewPassword: boolean = false;
  // totpRequired: boolean = false;
  firstLogin: boolean = false;
  startAuth: boolean = false;
  isTempPassword: boolean = false;
  errorMessage: string | null = null;
  expiredLink: boolean = false;
  slides = [
    {
      companyLogo: '/assets/peya-logo.svg',
      imageSource: '/assets/peya-start1.webp',
      slideTitle: 'Llegó tu cuenta digital',
      slideMessage:
        '<b>Empanadas Mafalda</b> ahora podrás transferir las ganancias de tus ventas e ingresar dinero cuando quieras.',
    },
    {
      companyLogo: '/assets/peya-logo.svg',
      imageSource: '/assets/peya-start1.webp',
      slideTitle: 'Llegó tu cuenta digital',
      slideMessage:
        '<b>Empanadas Mafalda</b> ahora podrás transferir las ganancias de tus ventas e ingresar dinero cuando quieras.',
    },
    {
      companyLogo: '/assets/peya-logo.svg',
      imageSource: '/assets/peya-start1.webp',
      slideTitle: 'Llegó tu cuenta digital',
      slideMessage:
        '<b>Empanadas Mafalda</b> ahora podrás transferir las ganancias de tus ventas e ingresar dinero cuando quieras.',
    },
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    console.log('auth');
    const magicLinkParam = 'code';
    this.route.queryParams.subscribe((params) => {
      const hashedData = params[magicLinkParam];
      if (hashedData) {
        console.log('dato: ', hashedData);
        this.authService
          .getTokenFromLink({
            code: hashedData,
          })
          .subscribe({
            next: (response: any) => {
              console.log('token---> ', response);
              this.startAuth = true;
              this.firstLogin = false;
              this.expiredLink = false;
            },
            error: (error: any) => {
              console.error('Error en el inicio de sesión:', error);
              this.expiredLink = true;
              this.startAuth = false;
              this.firstLogin = false;
              this.errorMessage = error;
            },
          });
      } else if (!this.startAuth) {
        // Only navigate to login if the process hasn't started yet
        this.router.navigate(['/auth/login']);
      }
    });
  }
  goToSetPassword(): void {
    //this.router.navigate(['/auth/register']);
    this.startAuth = false;
    this.firstLogin = true;
    this.expiredLink = false;
  }
}
