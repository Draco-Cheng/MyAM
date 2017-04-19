import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecordsComponent } from './records.component';
import { ChildRoutingModule } from './records.routing';

import { HttpModule, JsonpModule } from '@angular/http';

@NgModule({
  imports: [CommonModule, ChildRoutingModule, HttpModule, JsonpModule],
  declarations: [RecordsComponent],
  providers: []
})
export class RecordsModule {}
