import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { AuthService } from 'src/app/services/auth.service';
import { provinceList } from 'src/app/utils/onboarding-lists';

@Component({
  selector: 'app-admin-data',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    MessagesModule,
    MatFormFieldModule,
    SidePanelHeaderComponent,
    MatProgressSpinnerModule,
    SidePanelFooterComponent,
  ],
  templateUrl: './admin-data.component.html',
  styleUrl: './admin-data.component.scss',
})
export class AdminDataComponent {
  provinceList = provinceList;
  accountInfo: any = {
    phone: '',
    email: '',
    name: '',
    address: {
      city: '',
      street: '',
      flat_number: '',
      state: '',
      street_number: '',
      zip_code: '',
    },
    address_text: '',
  }; // Datos de la cuenta
  loading: boolean = false; // Variable para mostrar el preloader
  showArrowBack: boolean = true;
  dataToEdit: any = {
    title: '',
    label: '',
    content: '',
  };
  editMode: boolean = false;
  // Temporary variable to hold the edited value
  editedAddress: any = {}; // Temporary variable to hold edited address values
  editedValue: string = '';
  isProcessing: boolean = false;
  constructor(
    private authService: AuthService,
    private onboardingService: OnboardingService,
    private sidePanelService: SidePanelService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.messageService.clearMessage();
    this.refreshValues();
  }

  refreshValues(): void {
    this.loading = true;

    this.onboardingService.getOnboardingInfo().subscribe(
      (data: any) => {
        this.accountInfo = {
          name: this.formatName(data.name),
          phone: data.phone,
          address: data.address,
          address_text:
            data.address.street +
            ' ' +
            data.address.street_number +
            ' ' +
            data.address.flat_number +
            ', ' +
            data.address.city +
            ', ' +
            data.address.state,
        };

        this.accountInfo.email = this.authService.getEmail();

        // Reset the edit form values
        if (this.editMode) {
          if (this.dataToEdit.value === 'phone') {
            this.editedValue = this.accountInfo.phone.substring(2);
          } else if (this.dataToEdit.value === 'email') {
            this.editedValue = this.accountInfo.email;
          } else if (this.dataToEdit.value === 'address') {
            this.editedAddress = { ...this.accountInfo.address };
            this.editedAddress.state = this.getProvinceValueByName(
              this.accountInfo.address.state
            );
          }

          // After refreshing, mark the form as invalid
          if (!this.formIsValid()) {
            console.log('Form is not valid after refresh');
          }
        }

        console.log(this.accountInfo);
        this.loading = false;
      },
      (error: any) => {
        this.messageService.showMessage(
          'Error al obterner datos de la cuenta ' + error.message,
          'error'
        );
        this.loading = false;
      }
    );
  }
  handleArrowBack() {
    if (!this.editMode) this.sidePanelService.close();
    else {
      this.messageService.clearMessage();
      this.refreshValues();
      this.editMode = false;
      this.dataToEdit = {
        title: '',
        label: '',
        content: '',
      };
    }
  }

  get currentValue() {
    if (this.dataToEdit.value === 'email') {
      return this.accountInfo.email;
    } else if (this.dataToEdit.value === 'address') {
      return this.accountInfo.address;
    } else {
      return this.dataToEdit.phone;
    }
  }

  editData(dataToEdit: string) {
    this.editMode = true;
    switch (dataToEdit) {
      case 'email':
        this.dataToEdit = {
          title: 'e-mail',
          label: 'Email',
          value: dataToEdit,
        };
        // Initialize editedValue with the current email
        this.editedValue = this.accountInfo.email;
        break;
      case 'address':
        this.dataToEdit = {
          title: 'domicilio',
          label: 'Domicilio',
          value: dataToEdit,
        };
        // Initialize editedAddress with the current address values
        this.editedAddress = { ...this.accountInfo.address };
        this.editedAddress.state = this.getProvinceValueByName(
          this.accountInfo.address.state
        );

        break;
      case 'phone':
        this.dataToEdit = {
          title: 'teléfono',
          label: 'Teléfono',
          value: dataToEdit,
        };
        // Initialize editedValue with the current phone
        this.editedValue = this.accountInfo.phone.substring(2);
        break;
      default:
        break;
    }
  }
  getProvinceValueByName(provinceName: string): string {
    const province = this.provinceList.find(
      (item) => item.viewValue === provinceName
    );
    return province ? province.value : '';
  }
  // Add form validation logic if needed
  formIsValid(): boolean {
    if (this.dataToEdit.value === 'address') {
      // Validate that none of the address fields are empty
      const addressChanged =
        this.editedAddress.city !== this.accountInfo.address.city ||
        this.editedAddress.street !== this.accountInfo.address.street ||
        this.editedAddress.flat_number !==
          this.accountInfo.address.flat_number ||
        this.editedAddress.state !==
          this.getProvinceValueByName(this.accountInfo.address.state) ||
        this.editedAddress.street_number !==
          this.accountInfo.address.street_number ||
        this.editedAddress.zip_code !== this.accountInfo.address.zip_code;
      const addressNotEmpty =
        !!this.editedAddress.city &&
        !!this.editedAddress.street &&
        !!this.editedAddress.state &&
        !!this.editedAddress.street_number &&
        !!this.editedAddress.zip_code;
      return addressChanged && addressNotEmpty;
    } else if (this.dataToEdit.value === 'email') {
      // Validate that email is not empty and has changed from the original
      const emailChanged = this.editedValue !== this.accountInfo.email;
      const emailNotEmpty = !!this.editedValue;
      const emailValid = this.validateEmail(this.editedValue);
      return emailChanged && emailNotEmpty && emailValid;
    } else if (this.dataToEdit.value === 'phone') {
      const phoneChanged = this.editedValue !== this.accountInfo.phone;
      const phoneNotEmpty = !!this.editedValue;
      const phoneLength = this.editedValue.length > 9;
      return phoneChanged && phoneNotEmpty && phoneLength;
    }
    return !!this.editedValue; // Default validation for other fields like phone
  }
  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
  formatName(street: string): string {
    if (!street) return '';

    return street
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  saveData() {
    this.isProcessing = true;
    // Prepare the data to send to the backend
    const updatedField = this.dataToEdit.value;
    let updatedValue;
    if (updatedField === 'address') {
      this.onboardingService
        .updateOnboardingAddress(this.editedAddress)
        .subscribe(
          (data: any) => {
            console.log(' data response ', data);
            if (data.is_ok) {
              this.messageService.showMessage(
                'Cambiaste tu ' + this.dataToEdit.title,
                'success'
              );
              setTimeout(() => {
                this.messageService.clearMessage();
              }, 5000);
              this.isProcessing = false;
              this.refreshValues();
            } else {
              this.messageService.showMessage(
                'Error al editar datos de la dirección ' + data.message,
                'error'
              );
              this.isProcessing = false;
            }
          },
          (error: any) => {
            this.messageService.showMessage(
              'Error al editar datos de la dirección ' + error.message,
              'error'
            );
            this.isProcessing = false;
          }
        );
    }
    if (updatedField === 'phone') {
      this.onboardingService.updateOnboardingPhone(this.editedValue).subscribe(
        (data: any) => {
          console.log(' data response ', data);
          if (data.is_ok) {
            this.messageService.showMessage(
              'Cambiaste tu ' + this.dataToEdit.title,
              'success'
            );
            setTimeout(() => {
              this.messageService.clearMessage();
            }, 5000);
            this.refreshValues();
            this.isProcessing = false;
          } else {
            this.messageService.showMessage(
              'Error al editar datos de la dirección ' + data.message,
              'error'
            );
            this.isProcessing = false;
          }
        },
        (error: any) => {
          this.messageService.showMessage(
            'Error al editar datos de la dirección ' + error.message,
            'error'
          );
          this.isProcessing = false;
        }
      );
    }
    if (updatedField === 'email') {
      setTimeout(() => {
        this.isProcessing = false;
        this.messageService.showMessage(
          'Cambiaste tu ' + this.dataToEdit.title,
          'success'
        );
        setTimeout(() => {
          this.messageService.clearMessage();
        }, 3000);
      }, 5000);
    }
    console.log('updating value: ', updatedField);
  }

  resetMessages(): void {
    this.messageService.clearMessage();
  }
}
