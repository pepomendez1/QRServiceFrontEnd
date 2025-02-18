import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsuranceDashboardComponent } from './insurance-dashboard.component';
const routes: Routes = [
  {
    path: '',
    component: InsuranceDashboardComponent, // This will be rendered when navigating to /app/investments
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsuranceDashboardRoutingModule {}
