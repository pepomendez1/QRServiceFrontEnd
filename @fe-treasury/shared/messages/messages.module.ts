import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from './messages.component';
import { MatIconModule } from '@angular/material/icon'; // Assuming you're using Angular Material icons

@NgModule({
  declarations: [MessagesComponent],
  imports: [CommonModule, MatIconModule],
  exports: [MessagesComponent],
})
export class MessagesModule {}
