import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { ConfigService } from 'src/app/services/config.service';
import { SafeUrl } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { getGuardProcessingState } from 'src/app/services/route-guards/app.guard';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SessionManagementService } from 'src/app/services/session.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginImg: SafeHtml | null = null;
  logoUrl: SafeHtml | null = null;
  logoUrlSafe: SafeUrl | undefined;
  isOnboardingRoute: boolean = true;
  authForm: FormGroup;
  hide = true;
  hidePin = true;
  isTempPassword: boolean = false;
  needNewPassword: boolean = false;
  isSubmitEnabled: boolean = false;
  isProcessing: boolean = false;
  errorMessage: boolean = false;
  errorMessageDescription: string = '';
  errorMessageTitle: string = '';
  isMobile: boolean = false;
  login_message_shop: string = '';
  login_message_finance: string = '';
  login_message_settings: string = '';
  usernameErrors: string[] = [];
  passwordErrors: string[] = [];
  pinCodeErrors: string[] = [];
  timeoutLogout: boolean = false;
  tokenExpirationLogoutCredentials: boolean = false;
  tokenExpirationLogoutOnboarding: boolean = false;

  isGuardProcessing: boolean = false;

  constructor(
    private sessionManagementService: SessionManagementService,
    private storeService: StoreDataService,
    private svgLibrary: SvgLibraryService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private pinCodeService: PinCodeService,
    private configService: ConfigService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.authForm = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(12),
      ]),
      pinCode: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^\d+$/),
      ]),
    });

    // Escucha los cambios en el formulario
    this.authForm.valueChanges.subscribe(() => {
      this.isSubmitEnabled = this.authForm.valid;
      this.errorMessage = false;
    });
  }

  getUsernameErrors(): string[] {
    const control = this.authForm.get('username');
    const errors: string[] = [];
    if (control?.hasError('required')) errors.push('Dato requerido.');
    if (control?.hasError('email')) errors.push('El formato no es inválido.');

    //console.log(' errors ', errors);
    return errors;
  }

  getPasswordErrors(): string[] {
    const control = this.authForm.get('password');
    const errors: string[] = [];
    if (control?.hasError('required')) errors.push('Dato requerido.');
    if (control?.hasError('minlength'))
      errors.push('El formato de la contraseña no es válido.');
    //console.log(' errors ', errors);
    return errors;
  }

  getPinCodeErrors(): string[] {
    const control = this.authForm.get('pinCode');
    const errors: string[] = [];
    if (control?.hasError('required')) errors.push('Dato requerido.');
    if (control?.hasError('minlength'))
      errors.push('El PIN debe contener 6 dígitos.');
    if (control?.hasError('pattern'))
      errors.push('El PIN debe contener solo números.');
    //console.log(' errors ', errors);
    return errors;
  }

  ngOnInit(): void {
    this.logoUrl = this.svgLibrary.getLogo();
    this.storeService.getStore().subscribe((store) => {
      this.login_message_shop = store.init_config?.login_message_shop || '';
      this.login_message_settings =
        store.init_config?.login_message_settings || '';
      this.login_message_finance =
        store.init_config?.login_message_finance || '';
    });

    this.svgLibrary.getSvg('finances').subscribe((svgContent) => {
      this.loginImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
        console.log('mobile mode: ', this.isMobile);
      });

    this.sessionManagementService.getLogoutReason().subscribe((reason) => {
      if (reason === 'timeout') {
        console.log('Session expired due to inactivity.');
        this.timeoutLogout = true;
        // Display a message to the user
      } else if (reason === 'token_expired_credentials') {
        console.log(
          'Session expired due to inactivity during credentials configuration.'
        );
        this.tokenExpirationLogoutCredentials = true;
      } else if (reason === 'token_expired_onb') {
        console.log(
          'Session expired due to inactivity during credentials onboarding.'
        );
        this.tokenExpirationLogoutOnboarding = true;
      }
    });

    getGuardProcessingState().subscribe((processing) => {
      this.isGuardProcessing = processing;
    });
  }

  getFormControl(controlName: string): FormControl {
    return this.authForm.get(controlName) as FormControl;
  }

  navigateToRecoverPassword() {
    this.router.navigate(['/auth/password-recovery']);
  }
  onSubmit(): void {
    if (this.authForm.invalid) {
      this.usernameErrors = this.getUsernameErrors();
      this.passwordErrors = this.getPasswordErrors();
      this.pinCodeErrors = this.getPasswordErrors();
      return;
    }

    //console.log('Form Submitted:', this.authForm.value);

    this.isProcessing = true;
    const pinCode = this.authForm.get('pinCode')!.value;
    const email = this.authForm.get('username')!.value.toLowerCase();

    // Primero obtenemos el clientId utilizando el ConfigService
    this.configService.getConfig().subscribe({
      next: (config: any) => {
        console.log('config: ', config);
        const clientId = config.portal_client_id; // Extraemos el clientId del objeto config

        console.log('clientId:', clientId);
        // Ahora validamos el PIN utilizando el PinCodeService con el PIN, el correo electrónico y el clientId
        this.pinCodeService
          .validatePinCode(pinCode, email, clientId)
          .subscribe({
            next: (pinResponse: any) => {
              if (pinResponse.isPinValid) {
                // Si el PIN es válido, proceder con el inicio de sesión
                this.authService.signIn(this.authForm.value).subscribe({
                  next: (response: any) => {
                    this.isProcessing = false;
                    if (response.tempPassword) {
                      console.log('Contraseña temporal requerida');
                      this.isTempPassword = true;
                    } else if (response.newPasswordRequired) {
                      console.log('Nueva contraseña requerida');
                      this.needNewPassword = true;
                    } else {
                      console.log('Inicio de sesión exitoso:', response);
                      this.router.navigate(['/']);
                    }
                  },
                  error: (error: any) => {
                    this.isProcessing = false;
                    this.errorMessage = true;
                    this.errorMessageTitle = 'Credenciales incorrectas';
                    this.errorMessageDescription =
                      'Los datos ingresados son incorrectos. Revisalos y volvé a intentar.';
                    console.error('Error en el inicio de sesión:', error);
                  },
                });
              } else {
                // Si el PIN no es válido, mostrar un error genérico
                this.isProcessing = false;
                this.errorMessage = true;
                this.errorMessageTitle = 'Credenciales incorrectas';
                this.errorMessageDescription =
                  'Los datos ingresados son incorrectos. Revisalos y volvé a intentar.';
                console.error('PIN inválido');
              }
            },
            error: (error: any) => {
              this.isProcessing = false;
              this.errorMessage = true;
              this.errorMessageTitle = 'Credenciales incorrectas';
              this.errorMessageDescription =
                'Los datos ingresados son incorrectos. Revisalos y volvé a intentar.';
              console.error('Error al validar el PIN:', error);
            },
          });
      },
      error: (error: any) => {
        this.isProcessing = false;
        this.errorMessage = true;
        this.errorMessageTitle = 'Error de configuración';
        this.errorMessageDescription =
          'Error obteniendo la configuración. Por favor, inténtalo de nuevo.';
        console.error('Error al obtener clientId:', error);
      },
    });
  }
}
