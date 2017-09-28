import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';

// Directive Component
import { RecordSummarizeTypePieChartDirectiveComponent } from './record-summarize-type-pie-chart.directive.component';

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
  	NgxChartsModule
  ],
  declarations: [
	  RecordSummarizeTypePieChartDirectiveComponent
  ],
  providers: [],
  exports: [RecordSummarizeTypePieChartDirectiveComponent]
})
export class RecordSummarizeTypePieChartDirectiveModule {}
