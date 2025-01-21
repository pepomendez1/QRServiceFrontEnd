import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'pin-code-ready',
  templateUrl: './pin-code-ready.component.html',
  styleUrls: ['./pin-code-ready.component.scss'],
})
export class PinCodeReadyComponent implements OnInit {
  isProcessing = false; // Tracks the processing state
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToStep(step: string) {
    //this.router.navigate(['/auth'], { queryParams: { token: '123456abcdef' } });
    // treasury completed
    this.router.navigate(['/auth']);
    // on-hold
  }
}
