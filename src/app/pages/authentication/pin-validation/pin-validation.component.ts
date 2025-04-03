import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { SafeHtml } from '@angular/platform-browser';
import { OnbFooterComponent } from '@fe-treasury/shared/onb-footer/onb-footer.component';
import { CommonModule } from '@angular/common';
import { CustomHeaderOnbModule } from '@fe-treasury/shared/custom-header-onb/custom-header-onb.module';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-pin-validation',
  standalone: true,
  imports: [
    OnbFooterComponent,
    CommonModule,
    CustomHeaderOnbModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './pin-validation.component.html',
  styleUrl: './pin-validation.component.scss',
})
export class PinValidationComponent {
  @ViewChild('digit1') firstInput!: ElementRef; // Reference to the first input of both forms
  logoUrl: SafeHtml | null = null;
  pinForm: FormGroup;
  email: any = '';
  isMobile: boolean = false;
  isProcessing = false; // Tracks the processing state
  setPin: string = '';
  private formChanged = false; // Tracks if the form has switched
  incorrectPin: boolean = false;
  constructor(
    private svgLibrary: SvgLibraryService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private pinCodeService: PinCodeService,
    private configService: ConfigService,
    private messageService: MessageService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.pinForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
    this.pinForm.valueChanges.subscribe(() => {
      this.messageService.clearMessage();
      this.incorrectPin = false;
    });
  }

  ngOnInit(): void {
    this.logoUrl = this.svgLibrary.getLogo();
    this.email = this.authService.getEmail();
    console.log('email.....', this.email);
    this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }
  ngAfterViewInit(): void {
    // Ensure focus works on initial load
    setTimeout(() => {
      this.focusOnFirstInput();
    }, 0);
  }
  ngAfterViewChecked(): void {
    // Focus the first input when forms switch
    if (this.formChanged) {
      this.formChanged = false; // Reset the flag
      this.focusOnFirstInput();
    }
  }
  focusOnFirstInput(): void {
    if (this.firstInput) {
      this.firstInput.nativeElement.focus();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);

    // Allow only numeric characters (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  handleBackspace(
    event: KeyboardEvent,
    previousInput: HTMLInputElement | null
  ): void {
    if (
      event.key === 'Backspace' &&
      (event.target as HTMLInputElement).value === ''
    ) {
      if (previousInput) {
        previousInput.focus();
        previousInput.value = ''; // Clear the previous input
      }
    }
  }

  moveToNextField(event: Event, nextField?: HTMLInputElement): void {
    const currentField = event.target as HTMLInputElement | null;

    if (currentField && currentField.value.length >= currentField.maxLength) {
      nextField?.focus();
    }
  }

  checkFormValidity(): void {
    const pin = Object.values(this.pinForm.value).join('');
    if (pin && pin.length !== 6) {
      this.messageService.showMessage(
        'El PIN debe tener 6 dígitos ',
        'warning'
      );
    } else if (pin && !/^\d+$/.test(pin)) {
      this.messageService.showMessage('El PIN debe ser numérico ', 'warning');
    }
  }

  submitPin(): void {
    if (this.pinForm.valid) {
      this.isProcessing = true;
      this.configService.getConfig().subscribe({
        next: (config: any) => {
          const clientId = config.portal_client_id;
          console.log('clientId:', clientId);
          this.validatePinCode(this.email, clientId);
        },
        error: () => {
          this.isProcessing = false;
          this.messageService.showMessage(
            'Error obteniendo la configuración. Inténtalo de nuevo.',
            'error'
          );
        },
      });
    }
  }

  private validatePinCode(email: string, clientId: string) {
    const pinCode = Object.values(this.pinForm.value).join('');
    this.pinCodeService.validatePinCode(pinCode, email, clientId).subscribe({
      next: () => {
        this.isProcessing = false;
        this.router.navigate(['/app/home']);
      },
      error: () => {
        this.isProcessing = false;
        this.incorrectPin = true;
      },
    });
  }
}
