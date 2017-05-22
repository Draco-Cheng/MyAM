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

// Global Directive Module
import { CurrencySelectionDirectiveModule } from '../_directive/currency-selection/module';
import { TypeMapPanelDirectiveModule } from '../_directive/type-map-panel/module';
import { TypeQuickListDirectiveModule } from '../_directive/type-quick-list/module';
import { RecordSummarizeTypeFlatDirectiveModule } from '../_directive/record-summarize-type-flat/module';


// style
import './records.style.less';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule,
    CurrencySelectionDirectiveModule,
    TypeMapPanelDirectiveModule,
    TypeQuickListDirectiveModule,
    RecordSummarizeTypeFlatDirectiveModule
  ],
  declarations: [
    RecordsViewComponent,
    RecordsAddComponent,
    
    RecordTableDirectiveComponent
  ],
  providers: []
})
export class RecordsModule {}
