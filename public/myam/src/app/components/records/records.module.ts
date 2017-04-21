import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RecordsComponent } from './records.component';
import { ChildRoutingModule } from './records.routing';

import { RecordTableDirectiveComponent } from './directive/record-table.directive.component';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule
  ],
  declarations: [
    RecordsComponent,
    RecordTableDirectiveComponent
  ],
  providers: []
})
export class RecordsModule {}
