import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CustomHeaderOnbComponent } from './custom-header-onb.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [CustomHeaderOnbComponent],
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatButtonModule],
  exports: [CustomHeaderOnbComponent],
  schemas: [],
})
export class CustomHeaderOnbModule {}
