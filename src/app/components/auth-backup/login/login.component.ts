import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { ConfigService } from 'src/app/services/config.service';
@Component({
  selector: 'app-login-peya',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isOnboardingRoute: boolean = true;
  authForm: FormGroup;
  hide = true;
  userName: string = '';
  isTempPassword: boolean = false;
  needNewPassword: boolean = false;
  isSubmitEnabled: boolean = false;
  isProcessing: boolean = false;
  errorMessage: string | null = null;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private pinCodeService: PinCodeService,
    private configService: ConfigService
  ) {
    this.authForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      pinCode: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^\d{6}$/),
        ],
      ],
    });
    this.authForm.valueChanges.subscribe(() => {
      this.checkFormValidity();
    });
  }

  checkFormValidity(): void {
    //const password = this.authForm.get('newPassword')?.value;
    this.isSubmitEnabled =
      this.authForm.get('username')!.valid &&
      this.authForm.get('password')!.valid &&
      this.authForm.get('pinCode')!.valid;
  }
  ngOnInit(): void {
    this.checkFormValidity();
  }
  navigateToRecoverPassword() {
    this.router.navigate(['/auth/recover-password']);
  }
  onSubmit(): void {
    if (this.authForm.invalid) {
      this.checkFormValidity();
      return;
    }

    this.isProcessing = true;
    const pinCode = this.authForm.get('pinCode')!.value;
    const email = this.authForm.get('username')!.value; // Extraemos el email del formulario

    // Primero obtenemos el clientId utilizando el ConfigService
    this.configService.getConfig().subscribe({
      next: (config: any) => {
        const clientId = config.portal_client_id; // Extraemos el clientId del objeto config
        console.log('clientId:', clientId);
        // Ahora validamos el PIN utilizando el PinCodeService con el PIN, el correo electrónico y el clientId
        this.pinCodeService.validatePinCode(pinCode, email, clientId).subscribe({
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
                  this.errorMessage = 'Error en el inicio de sesión. Por favor verifica tus credenciales.';
                  console.error('Error en el inicio de sesión:', error);
                },
              });
            } else {
              // Si el PIN no es válido, mostrar un error genérico
              this.isProcessing = false;
              this.errorMessage = 'Error en el inicio de sesión. Por favor verifica tus credenciales.';
              console.error('PIN inválido');
            }
          },
          error: (error: any) => {
            this.isProcessing = false;
            this.errorMessage = 'Error en el inicio de sesión. Por favor verifica tus credenciales.';
            console.error('Error al validar el PIN:', error);
          },
        });
      },
      error: (error: any) => {
        this.isProcessing = false;
        this.errorMessage = 'Error obteniendo la configuración. Por favor, inténtalo de nuevo.';
        console.error('Error al obtener clientId:', error);
      }
    });
  }
}
