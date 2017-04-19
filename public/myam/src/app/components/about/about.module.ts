import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutComponent } from './about.component';
import { ChildRoutingModule } from './about.routing';

import { HttpModule, JsonpModule } from '@angular/http';

@NgModule({
  imports: [CommonModule, ChildRoutingModule, HttpModule, JsonpModule],
  declarations: [AboutComponent],
  providers: []
})
export class AboutModule {}
