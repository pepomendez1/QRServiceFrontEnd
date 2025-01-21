import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private router: Router) {}

  ngOnInit(): void {}
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  goToResetCredentials(): void {
    this.resetCredentials.emit(); // Call stepCompleted method
  }
}
