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
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { SidePanelHeaderComponent } from '../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { types } from 'util';

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
    SidePanelFooterComponent,
    SidePanelHeaderComponent,
  ],
  animations: [
    trigger('toggleContent', [
      state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('open', style({ height: '*', opacity: 1 })),
      transition('closed <=> open', [animate('300ms ease-in-out')]),
    ]),
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
})
export class FiltersComponent implements OnInit {
  @Output() applyFilters = new EventEmitter<any>();

  @Input() data!: {
    periodsList: string[];
    typesList: string[];
    statesList: string[];
    selectedPeriod: string;
    selectedTypes: string[];
    selectedStates: string[];
  };

  filtersForm!: FormGroup;

  isAccordionOpen = false;

  constructor(
    private sidePanelService: SidePanelService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    console.log('data', this.data);
    const selectAllTypes = this.data.selectedTypes.includes('Todas');
    const selectAllStates = this.data.selectedStates.includes('Todos');
    this.filtersForm = this.fb.group({
      selectAllTypes: selectAllTypes,
      selectAllStates: selectAllStates,
      selectedPeriod: this.data.selectedPeriod,
      selectedTypes: [this.data.selectedTypes],
      selectedStates: [this.data.selectedStates],
    });

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

    this.filtersForm
      .get('selectAllStates')
      ?.valueChanges.subscribe((isChecked) => {
        if (isChecked) {
          // Disable and uncheck all other checkboxes
          this.disableAndResetStates();
        } else {
          // Enable all other checkboxes
          this.enableStates();
        }
      });
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

  private disableAndResetStates(): void {
    this.filtersForm.get('selectedStates')?.setValue(['Todos']);
    this.data.statesList.forEach((state) => {
      this.filtersForm.get(state)?.disable();
    });
  }

  private enableStates(): void {
    this.filtersForm.get('selectedStates')?.setValue([]);
    this.data.statesList.forEach((state) => {
      this.filtersForm.get(state)?.enable();
    });
  }

  onTypeChange(type: string): void {
    let selectedTypes = this.filtersForm.value.selectedTypes;

    if (type === 'Todas') {
      // Select only 'Todas' and clear all other selections
      selectedTypes = ['Todas'];
    } else {
      // Deselect 'Todas' if other options are selected
      selectedTypes = selectedTypes.filter((t: string) => t !== 'Todas');

      // Toggle the selection of the clicked checkbox
      const index = selectedTypes.indexOf(type);
      if (index > -1) {
        selectedTypes.splice(index, 1);
      } else {
        selectedTypes.push(type);
      }
    }

    this.filtersForm.patchValue({ selectedTypes });
  }

  onStateChange(state: string): void {
    let selectedStates = this.filtersForm.value.selectedStates;

    if (state === 'Todos') {
      // Select only 'Todos' and clear all other selections
      selectedStates = ['Todos'];
    } else {
      // Deselect 'Todos' if other options are selected
      selectedStates = selectedStates.filter((s: string) => s !== 'Todos');

      // Toggle the selection of the clicked checkbox
      const index = selectedStates.indexOf(state);
      if (index > -1) {
        selectedStates.splice(index, 1);
      } else {
        selectedStates.push(state);
      }
    }

    this.filtersForm.patchValue({ selectedStates });
  }

  isTypeDisabled(type: string): boolean {
    // Disable other options if 'Todas' is selected
    return (
      this.filtersForm.value.selectedTypes.includes('Todas') && type !== 'Todas'
    );
  }

  isStateDisabled(state: string): boolean {
    // Disable other options if 'Todos' is selected
    return (
      this.filtersForm.value.selectedStates.includes('Todos') &&
      state !== 'Todos'
    );
  }

  onSubmit(): void {
    this.applyFilters.emit(this.filtersForm.value);
    this.sidePanelService.close();
    console.log('Filters Applied:', this.filtersForm.value);
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  clearFilters() {
    this.filtersForm.setValue({
      selectAllTypes: true,
      selectAllStates: true,
      selectedPeriod: 'Último mes',
      selectedTypes: ['Todas'],
      selectedStates: ['Todos'],
    });
    setTimeout(() => {
      this.sidePanelService.close();
      this.applyFilters.emit(this.filtersForm.value);
    }, 500);
  }
}
