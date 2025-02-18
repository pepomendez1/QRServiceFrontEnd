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
import { SidePanelHeaderComponent } from '../../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
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
    selectedPeriod: string;
    selectedTypes: string[];
  };

  filtersForm!: FormGroup;

  isAccordionOpen = false;

  constructor(
    private sidePanelService: SidePanelService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('data', this.data);
    const selectAllTypes = this.data.selectedTypes.includes('Todas');

    this.filtersForm = this.fb.group({
      selectAllTypes: selectAllTypes,
      selectedPeriod: this.data.selectedPeriod,
      selectedTypes: [this.data.selectedTypes]
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

    /*this.filtersForm
      .get('selectAllStates')
      ?.valueChanges.subscribe((isChecked) => {
        if (isChecked) {
          // Disable and uncheck all other checkboxes
          this.disableAndResetStates();
        } else {
          // Enable all other checkboxes
          this.enableStates();
        }
      });*/
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

  isTypeDisabled(type: string): boolean {
    // Disable other options if 'Todas' is selected
    return (
      this.filtersForm.value.selectedTypes.includes('Todas') && type !== 'Todas'
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
      selectedPeriod: 'Último año',
      selectedTypes: ['Todas'],
    });
    setTimeout(() => {
      this.sidePanelService.close();
      this.applyFilters.emit(this.filtersForm.value);
    }, 500);
  }
}
