import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InsuranceDashboardComponent } from './insurance-dashboard.component';
import { InsuranceDashboardRoutingModule } from './insurance-dashboard-routing.module';
import { GeneralFailureComponent } from '@fe-treasury/shared/general-failure/general-failure.component';
import { InsuranceListComponent } from 'src/app/components/insurance-list/insurance-list.component';
@NgModule({
  declarations: [InsuranceDashboardComponent, InsuranceListComponent],
  imports: [
    CommonModule,
    MaterialModule,
    InsuranceDashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    GeneralFailureComponent,
  ],
})
export class InsuranceDashboardModule {}
