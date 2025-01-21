import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-peya',
  templateUrl: './start-onb-peya.component.html',
  styleUrls: ['./start-onb-peya.component.scss'],
})
export class StartOnbPeyaComponent {
  isOnboardingRoute: boolean = true;
  constructor(private router: Router) {}

  goToStep(step: string) {
    console.log('hola');
    this.router.navigate(['/auth/register']);
  }
}
