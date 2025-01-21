// auth.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MFAService } from '../../services/mfa.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  showMFA: boolean = false;
  isTempPassword: boolean = false;
  needNewPassword: boolean = false;
  totpRequired: boolean = false;
  mfaSetupRequired: boolean = false;
  mfaSelection: boolean = false;
  secretCode: string | null = null;
  qrCodeImage: string = '';
  qrShown: boolean = false;
  mfaType: string | null = null;
  showPhoneNumberInput: boolean = false;
  isSubmitEnabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mfaService: MFAService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      mfaCode: [''],
      mfaType: ['', Validators.required],
      mfaToken: [''],
      deviceName: [''],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      ],
    });

    this.authForm.valueChanges.subscribe(() => {
      this.checkFormValidity();
    });
  }

  onboardingPartnerInput: string = 'PEYA'; //obtener del BE

  ngOnInit(): void {
    this.checkFormValidity();
  }

  checkFormValidity() {
    if (this.needNewPassword) {
      this.isSubmitEnabled =
        this.authForm.get('newPassword')!.valid &&
        this.authForm.get('confirmPassword')!.valid &&
        !this.authForm.hasError('passwordMismatch');
    } else if (this.showMFA) {
      this.isSubmitEnabled = this.authForm.get('mfaCode')!.valid;
    } else if (this.mfaSetupRequired) {
      if (this.showPhoneNumberInput) {
        this.isSubmitEnabled = this.authForm.get('phoneNumber')!.valid;
      } else if (this.qrShown) {
        this.isSubmitEnabled = this.authForm.get('mfaToken')!.valid;
      } else {
        this.isSubmitEnabled = this.authForm.get('mfaType')!.valid;
      }
    } else {
      this.isSubmitEnabled =
        this.authForm.get('username')!.valid &&
        this.authForm.get('password')!.valid;
    }
    console.log('Formulario válido:', this.isSubmitEnabled);
  }

  onSubmit() {
    console.log('Form submitted', this.authForm.value);

    if (this.needNewPassword) {
      console.log('Handling new password requirement');
      if (
        this.authForm.value.newPassword !== this.authForm.value.confirmPassword
      ) {
        console.error('Passwords do not match');
        return;
      }

      this.authService.completeNewPassword(this.authForm.value).subscribe(
        (response: any) => {
          if (response.mfaRequired || response.totpRequired) {
            this.showMFA = true;
            this.authForm.patchValue({ mfaType: 'SOFTWARE_TOKEN_MFA' }); // Set MFA type
            // Transition to MFA setup
            this.mfaSetupRequired = true; // Ensuring MFA setup is required after setting the new password
            console.log('Transitioning to MFA setup');
          } else {
            console.log('Autenticación completada exitosamente:', response);
            // Navigate to the main application or dashboard
            this.router.navigate(['/']);
          }
        },
        (error: any) => {
          console.error('Error completando nueva contraseña:', error);
        }
      );
    } else if (this.showMFA || this.totpRequired) {
      console.log('Verificación MFA', this.authForm.value);
      if (
        this.authForm.value.mfaCode &&
        this.authForm.value.mfaCode.length >= 6
      ) {
        console.log('Verificando MFA con token de software');
        this.authService
          .verifyMFA({ mfaCode: this.authForm.value.mfaCode })
          .subscribe(
            (response: any) => {
              console.log('MFA verificado exitosamente:', response);
              // Navigate to the main application or dashboard
              this.router.navigate(['/']);
            },
            (error: any) => {
              console.error('Error verificando MFA:', error);
            }
          );
      } else {
        console.log(
          'No se cumple la condición para MFA o el código es demasiado corto'
        );
      }
    } else if (this.mfaSetupRequired) {
      console.log('Configuración MFA');
      if (this.authForm.value.mfaType === 'SOFTWARE_TOKEN_MFA') {
        console.log('Configurando token de software MFA');
        this.setupSoftwareTokenMFA();
      } else if (this.authForm.value.mfaType === 'SMS_MFA') {
        console.log('Configurando SMS MFA');
        this.showPhoneNumberInput = true;
      } else {
        console.log('No se cumple la condición para configurar MFA');
      }
    } else {
      console.log('Inicio de sesión', this.authForm.value);
      this.authService.signIn(this.authForm.value).subscribe(
        (response: any) => {
          console.log('Inicio de sesión en progreso:', response);
          if (response.tempPassword) {
            console.log('Contraseña temporal requerida');
            this.isTempPassword = true;
          } else if (response.newPasswordRequired) {
            console.log('Nueva contraseña requerida');
            this.needNewPassword = true;
          } else if (response.mfaRequired || response.totpRequired) {
            console.log('MFA o TOTP requerido');
            this.showMFA = true;
            this.totpRequired = !!response.totpRequired;
            this.authForm.patchValue({ mfaType: 'SOFTWARE_TOKEN_MFA' }); // Set MFA type
          } else if (response.mfaSetup) {
            console.log('MFA setup requerido');
            this.mfaSetupRequired = true;
            this.mfaSelection = true;
          } else {
            console.log('Inicio de sesión exitoso:', response);
            // Navigate to the main application or dashboard
            this.router.navigate(['/']);
          }
        },
        (error: any) => {
          console.error('Error en el inicio de sesión:', error);
        }
      );
    }
  }

  setupSoftwareTokenMFA() {
    console.log('Setup Software Token MFA');
    if (this.authForm.value.mfaToken) {
      console.log('Verificando el token de software TOTP');
      this.authService
        .verifyTotpToken(
          this.authForm.value.mfaToken,
          this.authForm.value.deviceName
        )
        .subscribe(
          (response: any) => {
            console.log('Token TOTP verificado exitosamente:', response);
            // Manejar el caso de éxito, como redirigir al usuario o mostrar un mensaje de éxito
          },
          (error: any) => {
            console.error('Error verificando el token TOTP:', error);
            // Manejar el caso de error, como mostrar un mensaje de error
          }
        );
    } else {
      console.log('Configurando el token de software MFA');
      this.mfaService.setupMFA({ mfaType: 'SOFTWARE_TOKEN_MFA' }).subscribe(
        (response: any) => {
          console.log('MFA configurado exitosamente:', response);
          if (response.secretCode) {
            this.secretCode = response.secretCode;
            this.generateQRCode(
              response.secretCode,
              this.authForm.value.username
            );
            this.qrShown = true;
          }
        },
        (error: any) => {
          console.error('Error configurando MFA:', error);
        }
      );
    }
  }

  private generateQRCode(secret: string, username: string) {
    console.log('Generating QR code');
    const issuer = 'WibondConnect';
    const otpauthUrl = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
    this.qrCodeImage = otpauthUrl;
  }

  back() {
    console.log('Back button pressed');
    if (this.qrShown) {
      this.qrShown = false;
      this.qrCodeImage = '';
      this.secretCode = null;
    } else if (this.showPhoneNumberInput) {
      this.showPhoneNumberInput = false;
    } else if (this.mfaSelection) {
      this.mfaSelection = false;
      this.mfaType = null;
    } else if (this.mfaSetupRequired) {
      this.mfaSetupRequired = false;
      this.mfaType = null;
    }
  }
}
