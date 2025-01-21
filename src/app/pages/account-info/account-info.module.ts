import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { AccountInfoRoutingModule } from './account-info-routing.module';
import { AccountInfoComponent } from './account-info.component';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
@NgModule({
  declarations: [AccountInfoComponent],
  imports: [
    MaterialModule,
    MessagesModule,
    CommonModule,
    AccountInfoRoutingModule,
  ],
})
export class AccountInfoModule {}
