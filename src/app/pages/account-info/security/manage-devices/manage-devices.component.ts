import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { AuthService } from 'src/app/services/auth.service';
import { RelativeTimePipe } from 'src/app/pipes/relative-time.pipe';
import { forkJoin } from 'rxjs'; // Import forkJoin for concurrent observables
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'app-manage-devices',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    SidePanelHeaderComponent,
    MatProgressSpinnerModule,
    RelativeTimePipe,
    SidePanelFooterComponent,
  ],
  templateUrl: './manage-devices.component.html',
  styleUrl: './manage-devices.component.scss',
})
export class ManageDevicesComponent {
  @Output() backToOptions = new EventEmitter<void>();
  devices: any[] = []; // Store device list here
  loading = true; // Show loading indicator
  errorMessage: string | null = null;
  currentDeviceKey: string | null = null;
  constructor(
    private snackBarService: SnackbarService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getActiveDevices();
  }

  private getActiveDevices(): void {
    this.loading = true;
    this.authService.listActiveDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
        console.log('dispositivos ', devices);
        this.currentDeviceKey = sessionStorage.getItem('currentDeviceKey');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching devices:', error);
        this.errorMessage =
          'Error cargando dispositivos. Intente en otro momento';
        this.handleError(this.errorMessage);
        this.loading = false;
      },
    });
  }

  handleArrowBack() {
    this.backToOptions.emit();
  }
  getDeviceAttribute(
    device: any,
    attributeName: string,
    attributePart?: string
  ): string {
    const attribute = device.DeviceAttributes.find(
      (attr: any) => attr.Name === attributeName
    );

    if (attribute) {
      const deviceName = attribute.Value;
      const osAndBrowser = this.extractOSAndBrowser(deviceName);

      switch (attributePart) {
        case 'os':
          return osAndBrowser.os;
        case 'browser':
          return osAndBrowser.browser;
        default:
          return 'Unknown';
      }
    }
    return attribute ? attribute.Value : 'Unknown';
  }
  private extractOSAndBrowser(deviceName: string): {
    os: string;
    browser: string;
  } {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    // Extract OS information
    if (deviceName.includes('Windows NT')) {
      os = 'Windows';
    } else if (deviceName.includes('Mac OS X')) {
      os = 'Mac OS';
    } else if (deviceName.includes('Android')) {
      os = 'Android';
    } else if (deviceName.includes('iPhone') || deviceName.includes('iPad')) {
      os = 'iOS';
    } else if (deviceName.includes('Linux')) {
      os = 'Linux';
    } else os = 'SO Desconocido';

    // Extract browser information
    if (deviceName.includes('Chrome')) {
      browser = 'Chrome';
    } else if (
      deviceName.includes('Safari') &&
      !deviceName.includes('Chrome')
    ) {
      browser = 'Safari';
    } else if (deviceName.includes('Firefox')) {
      browser = 'Firefox';
    } else if (deviceName.includes('Edge')) {
      browser = 'Edge';
    } else if (deviceName.includes('Trident') || deviceName.includes('MSIE')) {
      browser = 'Internet Explorer';
    } else browser = 'Desconocido';

    return { os, browser };
  }

  openConfirmationDialog(
    type: string,
    deviceName?: string,
    deviceKey?: string
  ): void {
    let messageTitle = '';
    let messageContent = '';
    if (type == 'all') {
      messageTitle = '¿Querés cerrar la sesión en todos los dispositivos?';
      messageContent =
        'Cerrarás la sesión en todos los dispositivos, incluyendo el que estás usando ahora.';
    } else if (type == 'device' && deviceName && deviceKey) {
      messageTitle = `¿Querés olvidar el dispositivo ${deviceName}?`;
      messageContent =
        'Este proceso no cierra la sesión del dispositivo. Para cerrar sesión, utilizá la opción "cerrar sesión en todos los dispositivos"';
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '600px',
      data: { messageTitle: messageTitle, messageContent: messageContent },
      disableClose: true,
      backdropClass: 'backdrop-class',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (type === 'all') {
          this.logoutAllDevices();
        } else if (deviceKey) {
          this.logoutDevice(deviceKey);
        }
      }
    });
  }

  isCurrentDevice(device: any): boolean {
    return this.currentDeviceKey === device.DeviceKey; // Compare with the provided device's DeviceKey
  }

  private logoutDevice(deviceKey: string): void {
    console.log(`Logging out from device: ${deviceKey}`);
    this.authService.logoutCognitoDevice(deviceKey).subscribe({
      next: () => {
        console.log(`Logged out from device with key: ${deviceKey}`);
        // Update UI by removing the logged-out device
        if (deviceKey === this.currentDeviceKey) {
          // Clearing auth tokens
          sessionStorage.removeItem('auth_data');
          sessionStorage.removeItem('currentDeviceKey');
          // Redirect to login page
          this.router.navigate(['/auth/login']);
        } else this.getActiveDevices(); // Refresh the device list
      },
      error: (err) => {
        console.error('Error al olvidar dispositivo: ', err);
        this.errorMessage = 'Error al olvidar dispositivo';
        this.handleError(this.errorMessage);
      },
    });
    //this.authService.logoutDevice(deviceKey)
  }

  //   logoutFromAllDevices(): void {
  //     const username = 'user@example.com'; // Replace with dynamic username if needed
  //     this.authService.adminUserGlobalSignOut(username).subscribe({
  //       next: () => {
  //         console.log('User logged out from all devices');
  //         // Optionally redirect the user to the login page
  //       },
  //       error: (err) => {
  //         console.error('Error logging out from all devices:', err);
  //       }
  //     });
  // }

  private logoutAllDevices(): void {
    if (!this.currentDeviceKey) {
      console.error('No current device key found');
      this.errorMessage = 'Failed to identify the current device.';
      return;
    }
    this.authService.logoutAllDevices().subscribe({
      next: () => {
        console.log('Logged out from all devices');
        this.getActiveDevices();
        // Update UI by removing the logged-out device
        // localStorage.removeItem('auth_data');
        // localStorage.removeItem('currentDeviceKey');
        // Redirect to login page
        // this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        console.error('Error al olvidar dispositivos: ', err);
        this.errorMessage = 'Error al cerrar sesión en dispositivos';
        this.handleError(this.errorMessage);
      },
    });
  }

  private handleError(error: any) {
    this.snackBarService.openError(error, true);
  }
}
