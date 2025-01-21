import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingIndicatorModule } from '@fe-treasury/shared/loading-indicator/loading-indicator.module';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppLayoutComponent } from './app-layout.component';
import { HeaderModule } from './header/header.module';
import { SidenavModule } from './sidenav/sidenav.module';
import { SidePanelComponent } from '@fe-treasury/shared/side-panel/side-panel.component';
import { NavigationModule } from './navigation/navigation.module';
@NgModule({
  declarations: [SidePanelComponent, AppLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MaterialModule,
    NavigationModule,
    LoadingIndicatorModule,
    HeaderModule,
    SidenavModule,
  ],
  exports: [AppLayoutComponent],
})
export class AppLayoutModule {}
