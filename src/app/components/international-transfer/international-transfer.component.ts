import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransferContactsComponent } from './transfer-contacts/transfer-contacts.component';
import { TransferAmountComponent } from './transfer-amount/transfer-amount.component';
import { ActivityDetailsComponent } from '../treasury/activity-details/activity-details.component';
import { OtpFormModule } from '@fe-treasury/shared/otp-form/otp-form.module';
import { OTPService } from 'src/app/services/otp.service';
import { FormatNamePipe } from 'src/app/pipes/format-name.pipe';
import { ChangeDetectorRef } from '@angular/core';
import { TreasuryService } from 'src/app/services/treasury.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
// Side Panel Imports
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-international-transfer',
  standalone: true,
  imports: [
    CommonModule,
    TransferContactsComponent,
    TransferAmountComponent,
    ActivityDetailsComponent,
    FormsModule,
    MatIconModule,
    MessagesModule,
    OtpFormModule,
    FormatNamePipe,
    MatDialogModule,
    MatProgressSpinnerModule,
    ConfirmationDialogComponent,
    SidePanelHeaderComponent,
    SidePanelFooterComponent,
  ],
  templateUrl: './international-transfer.component.html',
  styleUrl: './international-transfer.component.scss',
})
export class InternationalTransferComponent {
  isLoading: boolean = true;
  userAccountId: number = 0; // ID de la cuenta del usuario
  showContacts: boolean = true;
  accountOwner: any = null;
  accountOwnerTemp: any = null;
  typeDestination: string = 'new'; // Opción por defecto

  //balance - transfer
  availableFunds: number = 0; // Se inicializa en 0, será cargado dinámicamente
  amount: string = '';
  isProcessingTransfer: boolean = false;
  transferMotive: string = ''; // Motivo opcional
  accountDetails: boolean = true;
  transferSuccess: boolean = false;
  transferResult: any = null;
  operationId: any = null; //
  // opt data
  passwordImg: SafeHtml | null = null;
  public session: string | null = '';
  public challengeName: string | null = '';
  public otpObject: string = '';
  public buttonEnabled = false;
  public waitingForOtp: boolean = false;
  public userEmail: string | null = null;
  public otpError: string = '';
  public incorrectOTP: boolean = false;
  public clearForm = false;
  public timeOut: boolean = false;
  public resetTimer: boolean = false; // Reset timer signal

  // Header and Footer
  headerEnable: boolean = true;
  arrowBackEnabled: boolean = true;
  footerEnable: boolean = true;
  buttonDisabled: boolean = true;
  buttonText: string = 'Continuar';
  step: number = 0;

  constructor(
    private dialog: MatDialog,
    public svgLibrary: SvgLibraryService,
    public sidePanelService: SidePanelService,
    public authService: AuthService,
    public userService: UserService,
    private cdr: ChangeDetectorRef,
    private refreshService: RefreshService,
    public treasuryService: TreasuryService,
    private otpService: OTPService,
    private messageService: MessageService
  ) {
    this.loadInitialData();
  }

  loadInitialData() {
    this.svgLibrary.getSvg('enter-password').subscribe((svgContent) => {
      this.passwordImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    this.sidePanelService.togglePadding(false);
    this.isLoading = true;
    this.getUserId();
    this.getBalance();
    // setTimeout(() => {
    //   this.isLoading = false;
    // }, 1000);
  }

  handleIsLoadingContacts(loading: boolean) {
    if (loading && this.footerEnable) {
      this.footerEnable = false;
      this.cdr.detectChanges(); // Mark the view for update
    } else if (!loading && !this.footerEnable) {
      this.footerEnable = true;
      this.cdr.detectChanges(); // Mark the view for update
    }
  }
  getAmount(amount: string) {
    console.log('amount: ', amount);
    this.amount = amount;
  }
  getUserId() {
    return this.userService.getAccountId().subscribe({
      next: (userId) => {
        console.log(userId);
        this.userAccountId = userId;
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
      },
    });
  }
  getBalance() {
    this.treasuryService.getBalance().subscribe({
      next: (balance) => {
        console.log('Balance fetched:', balance); // Agrega este log
        this.availableFunds = balance.balance;
        this.isLoading = false;
        //  this.userAccountId = balance.user_account_id
      },
      error: (err) => {
        console.error('Error fetching balance:', err);
        this.isLoading = false;
      },
    });
  }

  handleSelectedContact(accountData: any) {
    this.accountOwner = accountData;
    console.log('selected contact: ', accountData);
  }
  handleSelectedContactTemp(accountData: any) {
    this.accountOwnerTemp = accountData;
    console.log('selected contact temp: ', accountData);
  }
  handleContactType(type: any) {
    this.typeDestination = type;
    console.log('type: ', type);
    if (type === 'new') {
      this.showContacts = false;
      this.buttonDisabled = this.accountOwner ? false : true;
    }
    // if (type === 'agenda') {
    //   this.showContacts = false;
    //   //this.step = 1;
    // }
  }
  handleButtonEnabled(status: boolean) {
    this.buttonDisabled = !status;
  }

  askForOtp() {
    this.isLoading = true;
    this.buttonDisabled = true;
    this.userEmail = this.authService.getEmail();
    // first send code to email
    this.otpService.sendOtp(this.userEmail).subscribe((data: any) => {
      console.log('Otp sent:', data);
      this.session = data.Session;
      this.challengeName = data.ChallengeName;
      this.waitingForOtp = true;
      this.isLoading = false;
    });
  }
  handleOtpEvent(otp?: string) {
    if (otp) {
      this.otpObject = otp;
    }
    return;
  }

  restartValues(): void {
    this.session = localStorage.getItem('otpSession');
    this.challengeName = localStorage.getItem('challengeName');

    if (!this.userEmail || !this.session) {
      console.error('Missing email or session in localStorage');
      this.messageService.showMessage('Código incorrecto', 'error');
      // Optionally, redirect the user back to the request OTP screen or show an error message
    }
  }
  resendCode() {
    this.incorrectOTP = false;
    this.buttonDisabled = true;

    this.otpService.sendOtp(this.userEmail).subscribe({
      next: (response) => {
        console.log('OTP Sent:', response);
        //localStorage.setItem('otpEmail', this.email || '');
        localStorage.setItem('otpSession', response.Session);
        localStorage.setItem('challengeName', response.ChallengeName);
        this.timeOut = false;

        // Reset timer and force change detection
        this.resetTimer = true;
        setTimeout(() => (this.resetTimer = false), 0);
        this.messageService.showMessage('Código enviado!', 'success');
        this.clearForm = true;
        setTimeout(() => (this.clearForm = false), 0);

        setTimeout(() => {
          this.messageService.clearMessage();
        }, 5000);
        this.buttonDisabled = false;
        this.restartValues();
      },
      error: (error: any) => {
        console.error('Error sending OTP:', error);
        this.messageService.showMessage(
          'Error en el envío de mail!: ',
          'error'
        );
        this.buttonDisabled = false;
      },
    });
  }
  submitOtp() {
    this.buttonDisabled = true;
    const otpString = Object.values(this.otpObject).join('');

    this.otpService
      .verifyOtp(
        this.userEmail,
        otpString,
        this.session,
        this.challengeName || ''
      )
      .subscribe({
        next: (data: any) => {
          console.log('Otp verified:', data);
          this.waitingForOtp = false;
          this.confirmTransfer();
        },
        error: (error: any) => {
          this.incorrectOTP = true;
        },
      });
  }
  handleTimeOut(): void {
    console.log('Time Out');
    this.timeOut = true;
    this.messageService.showMessage(
      'El tiempo de validez del código ha caducado - ',
      'warning',
      'Reenviar código',
      () => this.resendCode()
    );
  }
  confirmTransfer() {
    this.isProcessingTransfer = true;
    this.headerEnable = false;
    this.footerEnable = false;

    // Clean and format the amount
    const cleanAmount = this.amount.replace(/\./g, '').replace(',', '.');
    const formattedAmount = parseFloat(cleanAmount).toFixed(2);

    // Build transfer details
    const transferDetails = {
      amount: formattedAmount,
      source: 'transfer',
      description: 'Transferencia enviada',
      name: this.accountOwner.name,
      destination: this.accountOwner.alias || '',
      user_account_id: this.userAccountId,
    };

    console.log('Confirmando transferencia:', transferDetails);

    // Perform the transfer
    this.treasuryService
      .makeTransfer(transferDetails)
      .pipe(
        finalize(() => this.handleFinalize()) // Run shared cleanup logic
      )
      .subscribe({
        next: (response) => {
          this.handleTransferSuccess(response);
        },
        error: (error) => {
          this.handleTransferError(error);
        },
      });
  }

  private handleTransferSuccess(response: any): void {
    console.log('Transferencia realizada con éxito:', response);
    this.transferSuccess = true;
    this.operationId = response.account_movement_id;
    console.log('operation Id ', this.operationId);
    this.transferResult = {
      status: 'success',
      message: 'Transferencia realizada con éxito.',
      details: response,
    };
  }

  private handleTransferError(error: any): void {
    console.error('Error al realizar la transferencia:', error);
    this.transferSuccess = false;
    this.operationId = error?.account_movement_id || null;
    console.log('operation Id ', this.operationId);
    this.transferResult = {
      status: 'error',
      message: 'Ocurrió un error durante la transferencia.',
      details: error,
    };
  }

  private handleFinalize(): void {
    this.isProcessingTransfer = false;
    this.sidePanelService.toggleDisableClose(false);
    this.refreshService.sendRefreshSignal();
    console.log('Transfer completed (success or error).');
    this.step = 3; // Change to step for success or error
    this.sidePanelService.togglePadding(true);
    setTimeout(() => {
      this.sidePanelService.togglePadding(false); // Reset padding for other steps
      if (this.operationId) {
        this.viewActivity(this.operationId);
        console.log('Move to certificate');
      } else {
        this.sidePanelService.close();
      }
    }, 5000); // 5-second delay
  }

  viewActivity(data: any) {
    console.log(data);
    this.sidePanelService.open(
      ActivityDetailsComponent,
      'Detalle de Movimiento',
      data
    );
  }
  nextStep(): void {
    console.log(this.typeDestination);
    console.log('next step');
    switch (this.step) {
      case 0:
        if (this.typeDestination === 'agenda')
          this.accountOwner = this.accountOwnerTemp;
        this.step++;
        break;
      case 1:
        this.step++;
        break;
      case 2:
        this.buttonText = 'Transferir';
        if (this.accountDetails) {
          this.buttonDisabled = this.accountOwner ? false : true;
          this.accountDetails = false;
          this.askForOtp();
          break;
        } else if (this.waitingForOtp) {
          this.submitOtp();
          break;
        }
        break;

      default:
        break;
    }
  }
  handleArrowBack(): void {
    if (this.step === 0) {
      if (!this.showContacts) this.showContacts = true;
      else this.sidePanelService.close();
    } else if (this.step > 0) {
      if (this.waitingForOtp) {
        this.accountDetails = true;
      }
      this.step--;

      this.waitingForOtp = false;
      console.log(' account owner ', this.accountOwner);
      if (this.step === 0) {
        this.buttonDisabled = this.typeDestination === 'new' ? false : true;
      }
    }
    console.log('next step');
  }

  openConfirmationDialog(): void {
    let messageTitle = '¿Estás seguro que querés salir de esta operación?';
    let messageContent = '';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '400px',
      data: { messageTitle: messageTitle, messageContent: messageContent },
      disableClose: true,
      backdropClass: 'backdrop-class',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.sidePanelService.close();
      }
    });
  }
}
