import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module'; // Routing module for Auth
import { AuthComponent } from './auth.component'; // Wrapper component for Auth

@NgModule({
  declarations: [AuthComponent],
  imports: [CommonModule, AuthRoutingModule],
})
export class AuthModule {}
