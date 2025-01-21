import {
  Component,
  ViewChild,
  AfterViewInit,
  ViewContainerRef,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidePanelService } from './side-panel.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent implements AfterViewInit {
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(private sidePanelService: SidePanelService) {}

  ngAfterViewInit() {
    this.sidePanelService.setSidenav(this.sidenav);
    this.sidePanelService.setViewContainerRef(this.container);
  }
}
