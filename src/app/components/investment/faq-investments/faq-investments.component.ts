import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
@Component({
  selector: 'app-faq-investments',
  standalone: true,
  imports: [SidePanelHeaderComponent],
  templateUrl: './faq-investments.component.html',
  styleUrl: './faq-investments.component.scss',
})
export class FaqInvestmentsComponent {}
