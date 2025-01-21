import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importamos el módulo del spinner
import { FormsModule } from '@angular/forms';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { TreasuryService } from 'src/app/services/treasury.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
@Component({
  selector: 'app-treasury-account-info',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MessagesModule,
    MatFormFieldModule,
    SidePanelFooterComponent,
    MatInputModule,
    SidePanelHeaderComponent,
    MatProgressSpinnerModule, // Añadimos el spinner
    FormsModule,
  ],
  templateUrl: './treasury-account-info.component.html',
  styleUrls: ['./treasury-account-info.component.scss'],
})
export class TreasuryAccountInfoComponent implements OnInit {
  previousValue = ''; // To store the value before editing
  isEditMode = false; // Track if in edit mode or not
  accountOwnerName: string | null = null;
  accountTaxId: string | null = null;
  accountInfo: any = { cvu: '', alias: '' }; // Datos de la cuenta

  copyMessageTimeout: any;
  errorMessageTimeout: any;
  loading: boolean = true; // Variable para mostrar el preloader
  showArrowBack: boolean = true;
  constructor(
    private treasuryService: TreasuryService,
    private clipboard: Clipboard,
    private messageService: MessageService,
    private onboardingService: OnboardingService,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    // Obtener la información de la cuenta
    this.messageService.clearMessage();
    this.treasuryService.getBalance().subscribe(
      (data: any) => {
        this.accountInfo = data?.accounts[0] || {}; // Asignar la información de la cuenta
        this.loading = false; // Ocultar el preloader cuando los datos están cargados
        this.onboardingName();
        console.log('datos de la cuenta------: ', this.accountInfo);
      },
      (error) => {
        console.error('Error al obtener los datos de la cuenta', error);
        this.loading = false; // Asegurarse de ocultar el preloader en caso de error
      }
    );
  }

  onboardingName(): void {
    // Obtener el nombre del onboarding
    this.onboardingService.getOnboardingName().subscribe(
      (response: any) => {
        console.log('from onboarding', response);
        this.accountOwnerName = response.first_name + ' ' + response.last_name;
        this.accountTaxId = response.tax_id_type + ' ' + response.tax_id;
      },
      (error: any) => {
        console.error('Error al obtener los datos de la cuenta', error);
        this.loading = false; // Asegurarse de ocultar el preloader en caso de error
      }
    );
  }
  // Lógica para copiar el CVU o alias al portapapeles
  copyToClipboard(field: string) {
    let text: string;

    if (field === 'CVU') {
      text = this.accountInfo.cvu;
    } else if (field === 'Alias') {
      text = this.accountInfo.alias;
    } else if (field === '') {
      text = `${this.accountOwnerName}\n${this.accountInfo.cvu}\n${this.accountInfo.alias}\n${this.accountTaxId}`;
    } else {
      return; // Si el campo no es válido, salir de la función
    }

    this.clipboard.copy(text);

    const message = field ? `${field} copiado` : 'Datos copiados';

    this.messageService.showMessage(
      message,
      'success'
    );

    if (this.copyMessageTimeout) {
      clearTimeout(this.copyMessageTimeout);
    }

    this.copyMessageTimeout = setTimeout(() => {
      this.messageService.clearMessage();
    }, 3000);
  }
  // Enable edit mode
  enableEditMode() {
    this.previousValue = this.accountInfo.alias; // Store the current value before editing
    this.isEditMode = true;
  }

  // Save the new value
  saveEdit() {
    const previousAlias = this.previousValue;
    const newAlias = this.accountInfo.alias;

    const aliasData = {
      user_account_id: this.accountInfo.id, // Assuming user_account_id is part of accountInfo
      alias: newAlias,
    };
    // Call the treasury service to update the alias
    this.treasuryService.updateAlias(aliasData).subscribe(
      (response) => {
        console.log('Alias updated successfully:', response);
        // Optionally update account info based on the response
        this.isEditMode = false; // Exit edit mode on successful save
        this.accountInfo.alias = 'Cargando...';
        this.ngOnInit();
        this.messageService.showMessage('Modificaste tu alias', 'success');
        this.errorMessageTimeout = setTimeout(() => {
          this.messageService.clearMessage();
        }, 3000);
        //this.accountInfo.alias = response.alias || newAlias;
      },
      (error) => {
        console.error('Error updating alias:', error);
        this.messageService.showMessage('error actualizando alias', 'error');
        // Restore the previous alias if there's an error
        this.accountInfo.alias = previousAlias;
        this.isEditMode = false; // Exit edit mode even on error
        this.errorMessageTimeout = setTimeout(() => {
          this.messageService.clearMessage();
        }, 3000);
      }
    );
  }

  // Cancel edit and restore the previous value
  cancelEdit() {
    this.accountInfo.alias = this.previousValue; // Revert back to the old value
    this.isEditMode = false;
  }

  handleArrowBack() {
    this.sidePanelService.close();
  }
}
