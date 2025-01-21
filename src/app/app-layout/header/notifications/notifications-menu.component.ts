import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LIST_FADE_ANIMATION } from '@fe-treasury/shared/list.animation';

@Component({
  selector: 'notifications-menu',
  templateUrl: './notifications-menu.component.html',
  styleUrls: ['./notifications-menu.component.scss'],
  animations: [...LIST_FADE_ANIMATION],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNotificationsComponent implements OnInit {
  notifications: any[] = [{}];
  isOpen: boolean = false;

  constructor() {}

  ngOnInit() {
    this.notifications = [
      {
        icon: 'notifications',
        name: 'Esta es una notificación',
        time: 'ahora',
        read: false,
        colorClass: '',
      },
      {
        icon: 'shopping_basket',
        name: 'Se realizó una compra',
        time: 'hace 23 min',
        read: false,
        colorClass: 'primary',
      },
      {
        icon: 'eject',
        name: 'Tienes una tarjeta pendiente',
        time: 'hace 1 hora',
        read: false,
        colorClass: 'accent',
      },
      {
        icon: 'cached',
        name: 'Nuevo usuario registrado',
        time: 'hace 6 horas',
        read: true,
        colorClass: '',
      },
      {
        icon: 'code',
        name: 'Juan quiere contactarse',
        time: 'ayer',
        read: true,
        colorClass: '',
      },
    ];
  }

  markAsRead(notification: any) {
    notification.read = true;
  }

  dismiss(notification: any, event: any) {
    event.stopPropagation();
    this.notifications.splice(this.notifications.indexOf(notification), 1);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  markAllAsRead() {
    this.notifications.forEach((notification) => (notification.read = true));
  }
}
