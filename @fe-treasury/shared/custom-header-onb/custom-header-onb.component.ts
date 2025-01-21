import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-header-onb',
  templateUrl: './custom-header-onb.component.html',
  styleUrl: './custom-header-onb.component.scss',
})
export class CustomHeaderOnbComponent {
  @Input() title: string = '';
  @Input() toolTip: string = 'Atrás';
  @Input() arrowBackEnabled: boolean = true;
  @Input() description: string = '';
  @Input() isMobile: boolean = false;
  @Output() arrowBack = new EventEmitter<void>();

  onArrowBack(): void {
    this.arrowBack.emit();
  }
}
