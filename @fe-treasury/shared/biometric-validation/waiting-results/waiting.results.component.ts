import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
@Component({
  selector: 'app-waiting-results-screen',
  templateUrl: './waiting-results.component.html',
  styleUrls: ['./waiting-results.component.scss'],
})
export class WaitingResultsScreenComponent {
  waitingResultImg: SafeHtml | null = null;
  constructor(private svgLibrary: SvgLibraryService) {}

  ngOnInit() {
    this.svgLibrary.getSvg('searching').subscribe((svgContent) => {
      this.waitingResultImg = svgContent; // SafeHtml type to display SVG dynamically
    });
  }
}
