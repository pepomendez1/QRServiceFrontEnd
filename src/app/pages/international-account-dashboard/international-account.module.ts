import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InternationalAccountRoutingModule } from './international-account-routing.module';
import { InternationalAccountComponent } from './international-account.component';
import { InvoiceSignInfoComponent } from 'src/app/components/invoice/invoice-sign-info/invoice-sign-info.component';
import { InternationalBalanceComponent } from 'src/app/components/international-balance/international-balance.component';
import { InternationalOperationsComponent } from 'src/app/components/international-operations/international-operations.component';
import { AmountDisplayComponent } from 'src/app/components/common/amount-display/amount-display.component';
import { GeneralFailureComponent } from '@fe-treasury/shared/general-failure/general-failure.component';
import { StatusPillPipe } from 'src/app/pipes/status-pill.pipe';

@NgModule({
  declarations: [
    InternationalAccountComponent,
    InternationalBalanceComponent,
    InvoiceSignInfoComponent,
    InternationalOperationsComponent,
    StatusPillPipe,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    InternationalAccountRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AmountDisplayComponent,
    GeneralFailureComponent,
  ],
  exports: [InternationalAccountComponent, StatusPillPipe],
})
export class InternationalAccountModule {}
