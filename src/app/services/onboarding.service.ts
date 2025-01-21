const ONBOARDING_STEPS = {
  KYC: 'kyc_kyb_pending',
  ADDRESS: 'address_pending',
  AFFIDAVIT: 'affidavit_terms_pending',
  COMPLETED: 'onboarding_completed',
};

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError, tap } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { ApiService } from './api.service';
export interface OnboardingResponse {
  type: string; // físicas/jurídicas
  step: string; // onboarding step
}

interface AfipFormData {
  cuil: number;
  phone: number;
  email: string;
}

interface AddressFormData {
  areaCode: number;
  phoneNumber: number;
  countryCode: number;
  street: string;
  city: string;
  useMetamapAddress: boolean;
  streetNumber: number;
  flatNumber: string;
  state: string;
  zipCode: number;
  maritalStatus: string;
}
interface AffidavitFormData {
  facta: string;
  ocde: string;
  pep: string;
  pepType: string;
  secSocialNumber: string;
  suj: string;
  taxId: string;
}

interface TermsFormData {
  terms: boolean;
  disclaimer: boolean;
}

interface AffidavitTermsFormData {
  terms: boolean;
  disclaimer: boolean;
  inv_saldo: boolean
  facta: string;
  ocde: string;
  pep: string;
  pepType: string;
  country: string;
  secSocialNumber: string;
  suj: string;
  taxId: string;
}

interface OnboardingStatusResponse {
  owner_id: string;
  status: string;
  metamap_status: string;
}

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private onboardingEndpoint = '/public/wibond-connect/onboarding';
  private onboardingFlowEndpoint =
    '/public/wibond-connect/onboarding/flow';
  private kycHistoryEndpoint =
    '/public/wibond-connect/onboarding/kyc-histories';

  private currentStepSubject = new BehaviorSubject<string>('kyc_kyb_pending');
  public currentStep$ = this.currentStepSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private onboardingFinishedSubject = new BehaviorSubject<boolean>(false);
  public onboardingFinished$ = this.onboardingFinishedSubject.asObservable();

  constructor(private apiService: ApiService) {}

  checkOnboardingStatus(): void {
    // Set loading to true
    this.isLoadingSubject.next(true);

    this.getOnboardingData().subscribe({
      next: (response: OnboardingStatusResponse) => {
        console.log('onboarding response: ', response);
        const currentStep = response.status;

        // Update current step and completion state
        this.currentStepSubject.next(currentStep);

        // If onboarding is completed
        if (currentStep === ONBOARDING_STEPS.COMPLETED) {
          this.onboardingFinishedSubject.next(true);
        }

        // Stop the loading spinner
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error obteniendo estado del onboarding: ', error);
        this.isLoadingSubject.next(false); // Stop loading on error
      },
    });
  }

  getOnboardingData(): Observable<OnboardingStatusResponse> {
    return this.apiService.get<any>(this.onboardingEndpoint).pipe(
      map((response) => {
        // Map only the necessary fields
        return {
          owner_id: response.owner_id,
          status: response.status,
          metamap_status: response.metamap_status,
        };
      }),
      catchError((error) => {
        console.error('Error fetching onboarding status:', error);
        throw error;
      })
    );
  }

  getOnboardingStatus(): Observable<any> {
    return this.apiService.get<any>(this.onboardingEndpoint);
  }

  getMetamapStatus(): Observable<any> {
    return this.apiService.get<any>(this.onboardingEndpoint).pipe(
      switchMap((status) => {
        return of(status.metamap_status);
      }),
      catchError((error) => {
        console.error('Error getting metamap Status', error);
        return throwError(() => error);
      })
    );
  }

  afipOnboarding(formData: AfipFormData): any {
    const data = {
      afip: {
        cuit: formData.cuil,
        phone: formData.phone,
        email: formData.email,
      },
    };
    return this.apiService.put<any>(this.onboardingFlowEndpoint, data);
  }

  addressOnboarding(formData: AddressFormData): any {
    const data = {
      personal_information: {
        marital_status: formData.maritalStatus,
        phone: {
          country_code: '54',
          //area: Number(formData.areaCode),
          number: formData.phoneNumber.toString(),
        },
        address: {
          use_metamap_address: formData.useMetamapAddress,
          city: formData.city,
          flat_number: formData.flatNumber,
          state_code: formData.state,
          street: formData.street,
          street_number: Number(formData.streetNumber),
          zip_code: formData.zipCode.toString(),
        },
      },
    };
    return this.apiService.put<any>(this.onboardingFlowEndpoint, data);
  }

  affidavitTermsOnboarding(formData: AffidavitTermsFormData): any {
    const data = {
      terms_cond: {
        terms: {
          option: formData.terms,
          version: '1.0',
        },
        inv_sal: {
          option: formData.inv_saldo,
          version: '1.0',
        },
        disclaimer: {
          option: formData.disclaimer,
          version: '1.0',
        },
      },
      affidavit: {
        facta: {
          option: formData.facta === 'yes',
          input: formData.facta === 'yes' ? formData.secSocialNumber : '',
        },
        ocde: {
          option: formData.ocde === 'yes',
          input:
            formData.ocde === 'yes'
              ? JSON.stringify({
                  tax_id: formData.taxId,
                  country: formData.country,
                })
              : '',
        },
        pep: {
          option: formData.pep === 'yes',
          input: formData.pep === 'yes' ? formData.pepType : '',
        },
        suj: {
          option: formData.suj === 'yes',
          input: '',
        },
      },
    };
    return this.apiService.put<any>(this.onboardingFlowEndpoint, data);
  }

  affidavitOnboarding(formData: AffidavitFormData): any {
    const data = {
      affidavit: {
        facta: {
          option: formData.facta === 'yes',
          input: formData.facta === 'yes' ? formData.secSocialNumber : '',
        },
        ocde: {
          option: formData.ocde === 'yes',
          input: formData.ocde === 'yes' ? formData.taxId : '',
        },
        pep: {
          option: formData.pep === 'yes',
          input: formData.pep === 'yes' ? formData.pepType : '',
        },
        suj: {
          option: formData.suj === 'yes',
          input: '',
        },
      },
    };
    return this.apiService.put<any>(this.onboardingFlowEndpoint, data);
  }

  termsOnboarding(formData: TermsFormData): any {
    const data = {
      terms_cond: {
        terms: {
          option: formData.terms,
          version: '1.0',
        },
        inv_sal: {
          option: false,
          version: '1.0',
        },
        disclaimer: {
          option: formData.disclaimer,
          version: '1.0',
        },
      },
    };
    return this.apiService.put<any>(this.onboardingFlowEndpoint, data);
  }

  getOnboardingName(): Observable<any> {
    return this.apiService.get<any>(this.onboardingEndpoint).pipe(
      tap((response) => {
        // Extract specific fields from the response
        return {
          name: response.name,
        };
      })
    );
  }

  getFirstName(): Observable<string | null> {
    return this.apiService
      .get<any>(this.onboardingEndpoint)
      .pipe(map((response) => response.first_name));
  }

  getOnboardingInfo(): Observable<any> {
    return this.apiService.get<any>(this.onboardingEndpoint).pipe(
      map((response) => {
        console.log('onboarding response : ', response);
        // Extract specific fields from the response
        return {
          name:
            response.first_name && response.last_name
              ? `${response.first_name} ${response.last_name}`
              : undefined,
          phone: response.phone ? response.phone : undefined,
          address: {
            city: this.formatUpperCase(response.account_address.city),
            street: this.formatUpperCase(response.account_address.street),
            flat_number: response.account_address.flat_number,
            state: response.account_address.state,
            street_number: response.account_address.street_number,
            zip_code: response.account_address.zip_code,
          },
        };
      }),
      tap((transformedResponse) => {
        console.log('Transformed response: ', transformedResponse);
      })
    );
  }

  // comenzar verificación biométrica para recupero de clave
  startKycHistoryRegister(): any {
    return this.apiService.post<any>(this.kycHistoryEndpoint, {});
  }

  getKycHistoryRegister(): any {
    return this.apiService.get<any>(this.kycHistoryEndpoint);
  }

  formatUpperCase(street: string): string {
    if (!street) return '';

    return street
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  updateOnboardingAddress(formData: any): any {
    console.log('form data: ', formData);
    const data = {
      personal_information: {
        address: {
          city: formData.city,
          flat_number: formData.flat_number,
          state_code: formData.state,
          street: formData.street,
          street_number: Number(formData.street_number),
          zip_code: formData.zip_code.toString(),
        },
      },
    };
    return this.apiService.put<any>(this.onboardingEndpoint, data);
  }
  updateOnboardingPhone(phoneNumber: string): any {
    console.log('phone number ', phoneNumber);
    const data = {
      personal_information: {
        phone: {
          country_code: '54',
          //area: Number(formData.areaCode),
          number: phoneNumber.toString(),
        },
      },
    };
    return this.apiService.put<any>(this.onboardingEndpoint, data);
  }
}
