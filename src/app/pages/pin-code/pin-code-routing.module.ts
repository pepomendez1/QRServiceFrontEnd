import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PinCodeComponent } from './pin-code.component';

const routes: Routes = [
  {
    path: '',
    component: PinCodeComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PinCodeRoutingModule {}
