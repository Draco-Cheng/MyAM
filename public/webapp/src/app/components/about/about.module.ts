import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutComponent } from './about.component';
import { ChildRoutingModule } from './about.routing';

@NgModule({
  imports: [CommonModule, ChildRoutingModule],
  declarations: [AboutComponent],
  providers: []
})
export class AboutModule {}
