import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { AuthService } from 'src/app/services/auth.service';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent {
  // --- States list Referencia ---------------------------------------------//
  // recoveryOptionsForm: Seleccionar qué se recupera (pin, password o ambos)
  // mailForm: Formulario para envío de OTP por mail
  // pinCodeValidation
  // passwordValidation
  // insertOTP: Formulario para ingresar OTP del mail
  // resetPassword: Reset de contraseña
  // resetPinCode: Pantalla para ingresar Pin code (reutilizada)
  // notificationScreen: Pantalla de success en cambios de pin o contraseña
  // biometricVerification"Validación por metamap
  // ---------------------------------------------------------------------//
  viewState: string = 'recoveryOptionsForm'; // Default state
  debugFEMode: boolean = false; //bypasses OTP, password PIN and kyc
  recoverOption: string = '';
  mobileMode: boolean = false;
  notificationText =
    'Para entrar a tu cuenta, volvé a iniciar sesión ingresando con tu nueva clave';

  notificationTitle = `¡Listo!<br>Ya cambiaste tu contraseña`;
  notificationType = 'success';
  emailOTP = '';
  logoUrl: SafeHtml | null = null;
  constructor(
    private svgLibrary: SvgLibraryService,
    private fb: FormBuilder,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.logoUrl = this.svgLibrary.getLogo();
    this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result) => {
        this.mobileMode = result.matches;
        console.log('mobile mode: ', this.mobileMode);
      });
  }
  returnToLogin() {
    this.router.navigate(['/auth/login']);
  }

  sendRecoveryMail(mail: string) {
    console.log('mail to send: ', mail);
    this.emailOTP = mail;
    switch (this.recoverOption) {
      case 'password':
        this.viewState = 'pinCodeValidation';
        break;
      case 'pin':
        this.viewState = 'passwordValidation';
        break;
      case 'password-pin':
        this.viewState = 'insertOTP';
        break;
      default:
        break;
    }
    // if (mail !== undefined) {
    //   console.log('send notification');
    //   this.notificationText =
    //     'Recibirás un código OTP (contraseña de único uso) para que ingreses a continuación:';

    //   this.notificationTitle = `Te hemos enviado un código a ${mail}`;
    //   this.notificationType = 'mail-sent';
    //   this.viewState = 'notificationScreen';
    // }
  }
  showOTPForm() {
    this.viewState = 'insertOTP';
  }

  returnToOptions() {
    this.viewState = 'recoveryOptionsForm';
  }
  returnToEmailForm() {
    this.emailOTP = '';
    this.viewState = 'mailForm';
  }
  newPasswordOK() {
    switch (this.recoverOption) {
      case 'password':
        this.notificationTitle = `¡Listo!<br>Ya cambiaste tu contraseña`;
        this.notificationText =
          'Para entrar a tu cuenta, volvé a iniciar sesión ingresando con tu nueva clave';
        this.notificationType = 'success';
        this.viewState = 'notificationScreen';
        break;
      case 'password-pin':
        this.viewState = 'resetPinCode';
        break;
      default:
        break;
    }
  }
  goToResetCredentials() {
    console.log('go To Reset Credentials');
    console.log('mode: ', this.recoverOption);
    switch (this.recoverOption) {
      case 'password':
        this.viewState = 'resetPassword';
        break;
      case 'pin':
        this.viewState = 'resetPinCode';
        break;
      case 'password-pin':
        this.viewState = 'biometricVerification';
        break;
      default:
        break;
    }
  }
  selectRecoveryType(option: string) {
    console.log('Form submitted: ', option);
    this.recoverOption = option;
    this.viewState = 'mailForm';
  }

  newPINOK(): void {
    switch (this.recoverOption) {
      case 'pin':
        this.notificationTitle = `¡Listo!<br>Ya cambiaste tu PIN`;
        this.notificationText =
          'Para entrar a tu cuenta, volvé a iniciar sesion usando tu nuevo número de PIN';
        break;
      case 'password-pin':
        this.notificationTitle = `¡Listo!<br>Ya cambiaste tu PIN y contraseña`;
        this.notificationText =
          'Para entrar a tu cuenta, volvé a iniciar sesion usando tu nueva clave y tu nuevo PIN';
        break;
      default:
        break;
    }
    this.notificationType = 'success';
    this.viewState = 'notificationScreen';
  }

  biometricValidationResult(result: boolean) {
    if (result) {
      this.viewState = 'resetPassword';
      // this.notificationTitle = ` Validamos tu identidad`;
      // this.notificationText =
      //   'Seguí los pasos para configurar tu nueva contraseña y tu nuevo PIN';
      // this.notificationType = 'biometric-ok';
    } else {
      this.notificationTitle = ` No pudimos validar tu identidad`;
      this.notificationText =
        'Estamos verificando tus datos. Te enviaremos un e-mail cuando este proceso finalice y puedas operar. ';
      this.notificationType = 'biometric-error';
      this.viewState = 'notificationScreen';
    }
  }

  resetCredentials(): void {
    this.viewState = 'resetPassword';
  }
}
