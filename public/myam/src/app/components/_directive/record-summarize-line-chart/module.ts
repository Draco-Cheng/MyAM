import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';

// Directive Component
import { RecordSummarizeLineChartDirectiveComponent } from './record-summarize-line-chart.directive.component';

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
  	NgxChartsModule
  ],
  declarations: [
	  RecordSummarizeLineChartDirectiveComponent
  ],
  providers: [],
  exports: [RecordSummarizeLineChartDirectiveComponent]
})
export class RecordSummarizeLineChartDirectiveModule {}
