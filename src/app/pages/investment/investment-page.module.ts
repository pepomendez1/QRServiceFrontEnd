import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentModule } from 'src/app/components/investment/investment.module';
import { InvestmentRoutingModule } from './investment-routing.module';
import { InvestmentPageComponent } from './investment-page.component';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';

@NgModule({
  declarations: [InvestmentPageComponent],
  imports: [
    MaterialModule,
    CommonModule,
    InvestmentModule,
    InvestmentRoutingModule,
  ],
  exports: [InvestmentPageComponent],
})
export class InvestmentPageModule {}
