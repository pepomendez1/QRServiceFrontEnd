import { Component } from '@angular/core';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import createFuzzySearch from '@nozbe/microfuzz';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { InsuranceService } from 'src/app/services/insurance.service';

@Component({
  selector: 'app-insurance-list',
  templateUrl: './insurance-list.component.html',
  styleUrl: './insurance-list.component.scss',
})
export class InsuranceListComponent {
  isFocused = false;
  searchQuery: string = '';
  fuzzySearch: any;
  searching: boolean = false;
  loading: boolean = false;
  noContracts: boolean = false;
  filteredInsuranceContracts: any[] = [];
  problemImg: SafeHtml | null = null;

  constructor(
    private refreshService: RefreshService,
    private svgLibrary: SvgLibraryService,
    private insuranceService: InsuranceService, // Servicio de seguros
    private sidePanelService: SidePanelService
  ) {
    this.loadInsuranceContracts();
  }

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    // Subscribe to the refresh signal
    this.refreshService.refresh$.subscribe(() => {
      this.loadInsuranceContracts();
    });
  }

  filterInsuranceContracts() {}
  loadInsuranceContracts() {
    this.loading = true; // Mostrar el loader
    this.noContracts = false; // Resetear el mensaje de "sin transacciones"

    this.insuranceService.getContracts().subscribe({});
  }
}
