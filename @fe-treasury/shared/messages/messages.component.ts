import { Component, OnInit } from '@angular/core';
import { MessageService } from './messages.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {
  messageContent: string | null = null;
  messageType: 'error' | 'success' | 'warning' | null = null;
  linkText: string | null = null;
  action: (() => void) | null = null;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.messageService.message$.subscribe((message) => {
      this.messageContent = message.content;
      this.messageType = message.type;
      this.linkText = message.linkText || null;
      this.action = message.action || null;
    });
  }

  get isVisible(): boolean {
    return this.messageContent !== null;
  }

  executeAction(): void {
    if (this.action) {
      this.action();
    }
  }
}
