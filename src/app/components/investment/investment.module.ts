import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentComponent } from './investment.component';
import { AvailableComponent } from './available/available.component';
import { ReturnsComponent } from './returns/returns.component';
import { KnowMoreInvestmentsComponent } from './know-more-investments/know-more-investments.component';
import { AmountDisplayComponent } from '../common/amount-display/amount-display.component';
import { GeneralFailureComponent } from '@fe-treasury/shared/general-failure/general-failure.component';
@NgModule({
  declarations: [InvestmentComponent, KnowMoreInvestmentsComponent],
  imports: [
    AvailableComponent,
    AmountDisplayComponent,
    ReturnsComponent,
    CommonModule,
    GeneralFailureComponent,
  ],
  exports: [InvestmentComponent],
})
export class InvestmentModule {}
