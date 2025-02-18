import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternationalAccountComponent } from './international-account.component';
const routes: Routes = [
  {
    path: '',
    component: InternationalAccountComponent, // This will be rendered when navigating to /app/investments
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalAccountRoutingModule {}
