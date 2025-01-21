import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-treasury-pending',
  templateUrl: './treasury-pending.component.html',
  styleUrls: ['./treasury-pending.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class TreasuryPendingScreen {
  @Output() stageCompleted = new EventEmitter<void>();
  isProcessing = true; // Tracks the processing state

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.isProcessing = true;
    const intervalId = setInterval(() => {
      console.log('polling status...');
      this.userService.getUserStatus().subscribe({
        next: (response: any) => {
          const status = response; // Adjust according to your API response format
          console.log('status: ', status);
          if (status === 'completed') {
            clearInterval(intervalId); // Stop the interval
            this.stageCompleted.emit(); // Call stepCompleted method
          }
        },
        error: (error: any) => {
          console.error('Error obteniendo el estado:', error);
          this.isProcessing = false;
          clearInterval(intervalId);
        },
      });
    }, 2000); // Poll every 2 seconds
  }
}
