import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvestmentPageComponent } from './investment-page.component';

const routes: Routes = [
  {
    path: '',
    component: InvestmentPageComponent, // This will be rendered when navigating to /app/investments
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvestmentRoutingModule {}
