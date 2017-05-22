import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



// Directive Component
import { RecordSummarizeTypeFlatDirectiveComponent } from './record-summarize-type-flat.directive.component';
import { RecordSumTypeMapFragmentDirectiveComponent } from './record-sum-type-map-fragment.directive.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
	  RecordSummarizeTypeFlatDirectiveComponent,
	  RecordSumTypeMapFragmentDirectiveComponent
  ],
  providers: [],
  exports: [RecordSummarizeTypeFlatDirectiveComponent]
})
export class RecordSummarizeTypeFlatDirectiveModule {}
