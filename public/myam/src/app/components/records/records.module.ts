import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routing
import { ChildRoutingModule } from './records.routing';

// components
import { RecordsViewComponent } from './view/records.view.component';
import { RecordsAddComponent } from './add/records.add.component';

// directives
import { RecordTableDirectiveComponent } from './_directive/record-table.directive.component';
import { RecordTypeMapDirectiveComponent } from './_directive/record-type-map.directive.component';
import { RecordQuickListDirectiveComponent } from './_directive/record-type-quick-list.directive.component';

// style
import './records.style.less';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule
  ],
  declarations: [
    RecordsViewComponent,
    RecordsAddComponent,
    
    RecordTableDirectiveComponent,
    RecordTypeMapDirectiveComponent,
    RecordQuickListDirectiveComponent
  ],
  providers: []
})
export class RecordsModule {}
