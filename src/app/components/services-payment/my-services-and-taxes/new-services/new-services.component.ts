import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { SidePanelHeaderComponent } from '../../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { types } from 'util';
import { MatCard } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import createFuzzySearch from '@nozbe/microfuzz';


@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatCard,
    MatSpinner,
    //SidePanelFooterComponent,
    SidePanelHeaderComponent,
  ],
  animations: [
    trigger('toggleContent', [
      state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('open', style({ height: '*', opacity: 1 })),
      transition('closed <=> open', [animate('300ms ease-in-out')]),
    ]),
  ],
  templateUrl: './new-services.component.html',
  styleUrl: './new-services.component.scss',
})
export class NewServiceComponent implements OnInit {
  @Output() applyFilters = new EventEmitter<any>();

  @Input() data!: {
    periodsList: string[];
    typesList: string[];
    selectedPeriod: string;
    selectedTypes: string[];
    popularServices: any
  };

  filtersForm!: FormGroup;
  //accountForm!: FormGroup;

  isAccordionOpen = false;
  accountInfo: any = {
    // Información de la cuenta (CVU, alias)
    nroCuenta: '',
    alias: '',
  };
  isFocused = false;
  searchQuery: string = '';
  searching: boolean = false; // Controlador del estado spinner de búsqueda
  fuzzySearch: any;

  filteredServices: any = {};
  noHistory: boolean = false; // Controlador del estado de "sin transacciones"

  selectedService: any = null

  // Asegúrate de que `popularServices` tenga este tipo
  //this.data.popularServices = {} as PopularServices;

  constructor(
    private sidePanelService: SidePanelService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('data', this.data);
    const selectAllTypes = this.data.selectedTypes.includes('Todas');

    this.filteredServices = { ...this.data.popularServices };

    this.filtersForm = this.fb.group({
      selectAllTypes: selectAllTypes,
      selectedPeriod: this.data.selectedPeriod,
      selectedTypes: [this.data.selectedTypes],
      searchQuery: [''],
      clientNumber: ['', Validators.required],
      alias: ['']
    });

   /* this.accountForm = this.fb.group({
      clientNumber: ['', Validators.required],
      alias: ['']
    });*/

    this.filtersForm
      .get('selectAllTypes')
      ?.valueChanges.subscribe((isChecked) => {
        if (isChecked) {
          // Disable and uncheck all other checkboxes
          this.disableAndResetTypes();
        } else {
          // Enable all other checkboxes
          this.enableTypes();
        }
      });

    // Escucha los cambios en el valor del campo de búsqueda
    this.filtersForm.get('searchQuery')?.valueChanges.subscribe((value) => {
      this.filterServices(value);
    });

    //this.filterServices(); // Apply the search filter whenever transactions are loaded/*  */
  }

  private disableAndResetTypes(): void {
    this.filtersForm.get('selectedTypes')?.setValue(['Todas']);
    this.data.typesList.forEach((type) => {
      this.filtersForm.get(type)?.disable();
    });
  }

  private enableTypes(): void {
    this.filtersForm.get('selectedTypes')?.setValue([]);
    this.data.typesList.forEach((type) => {
      this.filtersForm.get(type)?.enable();
    });
  }

  isTypeDisabled(type: string): boolean {
    // Disable other options if 'Todas' is selected
    return (
      this.filtersForm.value.selectedTypes.includes('Todas') && type !== 'Todas'
    );
  }

  onSubmit(): void {
    this.filterServices(this.searchQuery);
    //this.applyFilters.emit(this.filtersForm.value);
    //this.sidePanelService.close();
    console.log('Filters Applied:', this.searchQuery);
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  clearFilters() {
    this.filtersForm.setValue({
      selectAllTypes: true,
      selectedPeriod: 'Último año',
      selectedTypes: ['Todas'],
    });
    setTimeout(() => {
      this.sidePanelService.close();
      this.applyFilters.emit(this.filtersForm.value);
    }, 500);
  }



  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onCompanyClick(company: any, service: string) {
    console.log("Empresa seleccionada:", company);
    company.companyCategory=service
    this.selectedService = company
  }

  onViewAll(service: string) {
    console.log("Ver todas las empresas de:", service);
  }

  capitalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }


  filterServices(query: string) {
    console.log('filterServices:', query);

    const lowerQuery = query.toLowerCase(); // Para búsqueda sin distinción de mayúsculas

    this.filteredServices = Object.entries(this.data.popularServices).reduce((acc: any, [category, services]) => {
      const filteredServices = (services as any[]).filter(service =>
        service.companyName.toLowerCase().includes(lowerQuery) ||
        service.companyCode.toLowerCase().includes(lowerQuery)
      );
      console.log('filteredServices:', filteredServices);
      if (filteredServices.length > 0) {
        acc[category] = filteredServices;
      }
      return acc;
    }, {});
  }

  addService(){
    console.log('add service:', this.selectedService);
    this.selectedService = null;
  }

}
