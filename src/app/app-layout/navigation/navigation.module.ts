import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatNavList } from '@angular/material/list';
@NgModule({
  declarations: [NavigationComponent],
  imports: [CommonModule, MatIconModule, MatNavList, RouterModule],
  exports: [NavigationComponent],
})
export class NavigationModule {}
