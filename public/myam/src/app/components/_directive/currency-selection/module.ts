import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



// Directive Component
import { CurrencyMapDirectiveComponent } from './currency-map.directive.component';
import { CurrencySelectionDirectiveComponent } from './currency-selection.directive.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
	  CurrencyMapDirectiveComponent,
	  CurrencySelectionDirectiveComponent
  ],
  providers: [],
  exports: [CurrencyMapDirectiveComponent, CurrencySelectionDirectiveComponent]
})
export class CurrencySelectionDirectiveModule {}
