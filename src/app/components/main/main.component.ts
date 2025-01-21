import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';
import { OnboardingService } from 'src/app/services/onboarding.service'; // Importar el nuevo servicio
import { USER_STATUS } from 'src/app/consts/user-status';
import { SnackBarMessage } from '../common/snackbar/snackbar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  authData: any = null;
  decodedToken: any = null;
  userStatus: any = null;
  clientData: any = null;
  onboardingData: any = null; // Añadir una variable para almacenar los datos de onboarding
  isLoading: boolean = true;
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  onHoldStatus: boolean = false;
  constructor(
    private router: Router, // Importar el router
    private authService: AuthService,
    private tokenService: TokenService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private snackBarMessage: SnackBarMessage,
    private onboardingService: OnboardingService // Inyectar el servicio de onboarding
  ) {}

  USER_STATUS = USER_STATUS;
  currentUserStatus: string = ''; // USER_STATUS.ONBOARDING; //user status inicial
  onboardingPartnerInput: string = 'PEYA'; //obtener del BE

  ngOnInit(): void {
    this.isLoading = true;
    console.log('Main component initialized');
    const storedAuthData = this.tokenService.getStoredAuthData();
    if (
      storedAuthData &&
      !this.tokenService.isTokenExpired(storedAuthData.access_token)
    ) {
      console.log('Stored auth data:', storedAuthData);
      this.authData = storedAuthData;
      this.decodedToken = this.tokenService.decodeToken(
        storedAuthData.access_token
      );
      console.log(1);
      console.log(this.decodedToken);
      this.getClientDataAndUserStatus();
    } else {
      console.log('No stored auth data or token expired');
      this.authService.authDataSubject.subscribe((authData) => {
        this.authData = authData;
        if (authData && authData.access_token) {
          this.decodedToken = this.tokenService.decodeToken(
            authData.access_token
          );
          console.log(2);
          this.getClientDataAndUserStatus();
        } else {
          this.decodedToken = null;
        }
      });
      this.authService.initializeAuth();
    }
    this.cdr.detectChanges();
  }

  getClientDataAndUserStatus(): void {
    this.getUserStatus();
    // this.userService.getClientData().subscribe(
    //   (clientData) => {
    //     this.clientData = clientData;
    //     console.log('Client data:', this.clientData);
    //     this.getUserStatus();
    //   },
    //   (error) => {
    //     console.error('Error fetching client data:', error);
    //     this.snackBarMessage.showSnackbar(
    //       'Error fetching user status',
    //       'error'
    //     );
    //     this.errorMessage = error.error.message;
    //     this.isLoading = false;
    //   }
    // );
  }

  getUserStatus(): void {
    console.log('on hold status: ', this.onHoldStatus);
    this.isLoading = true;
    this.userService.getUserStatus().subscribe({
      next: (response) => {
        this.userStatus = response;
        console.log('User status:', this.userStatus);
        if (
          this.userStatus !== USER_STATUS.PIN &&
          this.userStatus !== USER_STATUS.ONBOARDING
        ) {
          this.onboardingService.getMetamapStatus().subscribe({
            next: (metamapStatus) => {
              if (metamapStatus !== 'Completed') {
                this.onHoldStatus = true;
              } else if (this.userStatus === USER_STATUS.COMPLETED) {
                this.router.navigate(['/app']);
              }
            },
            error: (error: any) => {
              console.log(error);
            },
          });
        }
        //this.currentUserStatus = USER_STATUS.COMPLETED; //for testing purposes
        this.currentUserStatus = this.userStatus;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user status:', error.error.message);
        this.errorMessage = error.error.message;
        this.isLoading = false;
        this.snackBarMessage.showSnackbar(
          'Error fetching user status',
          'error'
        );
      },
    });
  }

  // getOnboardingClientData(): void {
  //   this.onboardingService
  //     .getOnboardingClientData(this.clientData.clientID, 'ARG')
  //     .subscribe(
  //       (data: any) => {
  //         this.onboardingData = data;
  //         console.log('Onboarding client data:', this.onboardingData);
  //         // Manejar los datos de onboarding aquí
  //       },
  //       (error: any) => {
  //         console.error('Error fetching onboarding client data:', error);
  //       }
  //     );
  // }
}
