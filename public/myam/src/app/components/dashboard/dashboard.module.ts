import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { ChildRoutingModule } from './dashboard.routing';

@NgModule({
  imports: [CommonModule, ChildRoutingModule],
  declarations: [DashboardComponent],
  providers: []
})
export class DashboardModule {}
