import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { DashboardComponent } from './dashboard.component';
import { CardComponent } from 'src/app/components/card/card.component';
import { TreasuryActivityComponent } from 'src/app/components/treasury-activity/treasury-activity.component';
//import { TreasuryModule } from 'src/app/components/treasury/treasury.module';
import { DashboardRoutingModule } from './dashboard-routing.module'; // Import routing module
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TreasuryBalanceComponent } from 'src/app/components/treasury-balance/treasury-balance.component';
import { CardOrderComponent } from 'src/app/components/card/card-order/card-order.component';
import { AmountDisplayComponent } from '../../components/common/amount-display/amount-display.component';
import { GeneralFailureComponent } from '@fe-treasury/shared/general-failure/general-failure.component';
@NgModule({
  imports: [
    CommonModule,
    MaterialModule,

    ReactiveFormsModule,
    FormsModule,
    DashboardRoutingModule,
    AmountDisplayComponent,
    GeneralFailureComponent,
  ], // Add routing module
  exports: [DashboardComponent],
  declarations: [
    CardComponent,
    TreasuryBalanceComponent,
    TreasuryActivityComponent,
    CardOrderComponent,
    DashboardComponent,
  ],
})
export class DashboardModule {}
