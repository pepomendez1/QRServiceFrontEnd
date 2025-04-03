import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ClickOutsideModule } from '@fe-treasury/shared/click-outside/click-outside.module';
import { HeaderNotificationsComponent } from './notifications/notifications-menu.component';
import { HeaderComponent } from './header.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { HeaderMerchantsMenuComponent } from './merchants/merchants-menu.component';
import { SliderButtonComponent } from '@fe-treasury/shared/slider-button/slider-button.component';
@NgModule({
  imports: [
    CommonModule,
    MatSlideToggle,
    FormsModule,
    MaterialModule,
    ClickOutsideModule,
    SliderButtonComponent,
  ],

  declarations: [
    HeaderComponent,
    HeaderNotificationsComponent,
    HeaderMerchantsMenuComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [HeaderComponent],
})
export class HeaderModule {}
