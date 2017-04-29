import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routing
import { ChildRoutingModule } from './records.routing';

// components
import { RecordsViewComponent } from './view/records.view.component';
import { RecordsAddComponent } from './add/records.add.component';

// Directive Component
import { RecordTableDirectiveComponent } from './_directive/record-table.directive.component';
import { RecordTypeMapDirectiveComponent } from './_directive/record-type-map.directive.component';
import { RecordQuickListDirectiveComponent } from './_directive/record-type-quick-list.directive.component';

// Global Directive Module
import { CurrencySelectionDirectiveModule } from '../_directive/currency-selection/module';


// style
import './records.style.less';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule,
    CurrencySelectionDirectiveModule
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
