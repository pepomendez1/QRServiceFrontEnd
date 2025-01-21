import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { SidenavService } from './sidenav.service';
import { SidenavComponent } from './sidenav.component';
@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule],
  declarations: [SidenavComponent],
  exports: [SidenavComponent],
  providers: [SidenavService],
})
export class SidenavModule {}
