import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent {
  // --- States list Referencia ---------------------------------------------//
  // recoveryOptionsForm: Seleccionar qué se recupera (pin, password o ambos)
  // mailForm: Formulario para envío de OTP por mail
  // insertOTP: Formulario para ingresar OTP del mail
  // resetPassword: Reset de contraseña
  // resetPinCode: Pantalla para ingresar Pin code (reutilizada)
  // notificationScreen: Pantalla de success en cambios de pin o contraseña
  // ---------------------------------------------------------------------//
  viewState: string = 'recoveryOptionsForm'; // Default state
  debugFEMode: boolean = true; //bypasses OTP, password PIN and kyc
  recoverOption: string = '';
  mobileMode: boolean = false;
  notificationText =
    'Recibirás un código OTP (contraseña de único uso) para que ingreses a continuación:';

  notificationTitle = `Te hemos enviado un código a acastro@gmail.com`;
  notificationType = 'mail-sent';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result) => {
        this.mobileMode = result.matches;
      });
  }
  returnToLogin() {
    this.router.navigate(['/auth/login']);
  }

  sendRecoveryMail(mail: string) {
    console.log('mail to send: ', mail);

    if (mail !== undefined) {
      console.log('send notification');
      this.notificationText =
        'Recibirás un código OTP (contraseña de único uso) para que ingreses a continuación:';

      this.notificationTitle = `Te hemos enviado un código a ${mail}`;
      this.notificationType = 'mail-sent';
      this.viewState = 'insertOTP';
    }
  }
  returnToOptions() {
    this.viewState = 'recoveryOptionsForm';
  }
  returnToEmailForm() {
    this.viewState = 'mailForm';
  }
  newPasswordOK() {
    switch (this.recoverOption) {
      case 'password':
        this.notificationTitle = ` Ya cambiaste tu contraseña`;
        this.notificationText =
          'Para entrar a tu cuenta, volvé a iniciar sesión usando esta clave';
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
        this.notificationTitle = ` Ya cambiaste tu PIN`;
        this.notificationText =
          'Para entrar a tu cuenta, volvé a iniciar sesion usando tu clave y tu nuevo PIN';
        break;
      case 'password-pin':
        this.notificationTitle = ` Ya cambiaste tu clave y tu PIN`;
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
      this.notificationTitle = ` Validamos tu identidad`;
      this.notificationText =
        'Seguí los pasos para configurar tu nueva contraseña y tu nuevo PIN';
      this.notificationType = 'biometric-ok';
    } else {
      this.notificationTitle = ` No pudimos validar tu identidad`;
      this.notificationText =
        'Te pedimos que te contactes con el equipo de soporte para que te indiquen cómo recuperar tus credenciales';
      this.notificationType = 'biometric-error';
    }
    this.viewState = 'notificationScreen';
  }

  resetCredentials(): void {
    this.viewState = 'resetPassword';
  }
}
