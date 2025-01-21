import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'notification-screen',
  templateUrl: './notification-screen.component.html',
  styleUrls: ['./notification-screen.component.scss'],
})
export class NotificationScreenComponent {
  @Input() notificationTitle: string | undefined;
  @Input() notificationText: string | undefined;
  @Input() notificationType: string | undefined;
  @Output() resetCredentials = new EventEmitter<void>();
  @Output() emailForm = new EventEmitter<void>();
  @Output() showOTPForm = new EventEmitter<void>();
  constructor(private svgLibrary: SvgLibraryService, private router: Router) {}

  imageSource: SafeHtml | null = null;
  ngOnInit(): void {
    switch (this.notificationType) {
      case 'success':
        this.svgLibrary.getSvg('congrats').subscribe((svgContent) => {
          this.imageSource = svgContent; // SafeHtml type to display SVG dynamically
        });
        // this.imageSource = '../../../../../assets/images/welcome confetti.svg';
        break;
      case 'biometric-error':
        this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
          this.imageSource = svgContent; // SafeHtml type to display SVG dynamically
        });
        //this.imageSource = '../../../../../assets/images/problem.svg';
        break;
      default:
        break;
    }
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  goToResetCredentials(): void {
    this.resetCredentials.emit();
  }
  goToEmailForm(): void {
    this.emailForm.emit();
  }
  goToOTPForm() {
    this.showOTPForm.emit();
  }
}
