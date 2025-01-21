// user.service.ts
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { USER_STATUS } from '../consts/user-status';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userStatusEndpoint = '/public/wibond-connect/user/auth/status';
  private clientDataEndpoint =
    '/public/wibond-connect/user/auth/portalClient'; // Endpoint para obtener datos del cliente

  constructor(private apiService: ApiService) {}

  getUserStatus(): Observable<any> {
    // Debug values
    // return new Observable((subscriber) => {
    //   subscriber.next(USER_STATUS.PIN);
    // });
    console.log('getting user status');
    return this.apiService.get<any>(this.userStatusEndpoint).pipe(
      map((response) => {
        const firstAccountStatus = response.account_statuses[0];
        const {
          onboarding_status: onboardingStatus,
          pin_status: pinStatus,
          treasury_status: treasuryStatus,
        } = firstAccountStatus;

        // Early return for each distinct status
        if (pinStatus === 'Pending') {
          return USER_STATUS.PIN;
        }
        if (onboardingStatus === 'Pending') {
          return USER_STATUS.ONBOARDING;
        }
        if (treasuryStatus === 'Pending') {
          return USER_STATUS.TREASURY;
        }
        if (treasuryStatus === 'Completed') {
          return USER_STATUS.COMPLETED;
        }

        // Default return if none of the conditions match
        return 'unknown_status';
      })
    );
  }

  // return this.apiService.get<any>(this.userStatusEndpoint).pipe(
  //   map((response) => {
  //     return response.account_statuses
  //       .map((account: { create_date: string | number | Date }) => ({
  //         ...account,
  //         create_date: new Date(account.create_date),
  //       }))
  //       .sort(
  //         (a: any, b: any) =>
  //           b.create_date.getTime() - a.create_date.getTime()
  //       )[0];
  //   })
  // );

  getClientData(): Observable<any> {
    return this.apiService.get<any>(this.clientDataEndpoint);
  }

  getAccountId(): Observable<number> {
    return this.apiService.get<any>(this.userStatusEndpoint).pipe(
      map((response) => {
        //console.log('response ', response);
        const firstAccountStatus = response.account_statuses[0];
        return firstAccountStatus.account_id;
      })
    );
  }
}
