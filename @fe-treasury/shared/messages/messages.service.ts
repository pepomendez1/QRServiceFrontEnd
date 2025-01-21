import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Message {
  content: string | null;
  type: 'error' | 'success' | 'warning' | null;
  linkText?: string; // Optional link text
  action?: () => void; // Optional action to be triggered by the link
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageSubject = new BehaviorSubject<Message>({
    content: null,
    type: null,
  });

  message$ = this.messageSubject.asObservable(); // Observable for components to subscribe to

  showMessage(
    content: string,
    type: 'error' | 'success' | 'warning',
    linkText?: string,
    action?: () => void
  ) {
    this.messageSubject.next({ content, type, linkText, action });
  }

  clearMessage() {
    this.messageSubject.next({ content: null, type: null });
  }
}
