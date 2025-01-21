import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidePanelService } from '../side-panel.service';
import { MatIcon } from '@angular/material/icon';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-panel-header',
  imports: [NgFor, NgIf, CommonModule, MatIcon],
  standalone: true,
  templateUrl: './side-panel-header.component.html',
  styleUrls: ['./side-panel-header.component.scss'],
})
export class SidePanelHeaderComponent {
  @Input() title: string = 'Transferir'; // Default title
  @Input() arrowBackEnabled: boolean = true; // Default title
  @Input() closeButtonEnabled: boolean = true; // New input for close button
  @Output() arrowBack = new EventEmitter<void>();
  @Output() closePressed = new EventEmitter<void>();
  @Input() confirmRequired: boolean = false;

  constructor(public sidePanelService: SidePanelService) {}

  onArrowBack(): void {
    this.arrowBack.emit();
  }

  closeSidePanel() {
    if (this.confirmRequired) {
      this.closePressed.emit();
    } else {
      this.sidePanelService.close();
    }
  }
}
