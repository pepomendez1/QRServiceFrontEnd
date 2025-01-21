import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-end-peya',
  templateUrl: './end-onb-peya.component.html',
  styleUrls: ['./end-onb-peya.component.scss'],
})
export class EndOnbPeyaComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  isOnboardingRoute: boolean = true;
  constructor(private router: Router) {}

  goToStep() {
    this.router.navigate(['/auth']);
  }
}
