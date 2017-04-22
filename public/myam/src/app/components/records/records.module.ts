import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RecordsComponent } from './records.component';
import { ChildRoutingModule } from './records.routing';

import { RecordTableDirectiveComponent } from './_directive/record-table.directive.component';
import { RecordTypeMapDirectiveComponent } from './_directive/record-type-map.directive.component';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule
  ],
  declarations: [
    RecordsComponent,
    
    RecordTableDirectiveComponent,
    RecordTypeMapDirectiveComponent
  ],
  providers: []
})
export class RecordsModule {}
