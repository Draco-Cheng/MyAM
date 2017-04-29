import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routing
import { ChildRoutingModule } from './currency.routing';

// components
import { CurrencyViewComponent } from './view/currency.view.component';

// Directive Component
import { CurrencyEditMapDirectiveComponent } from './_directive/currency-edit-map.directive.component';

// Global Directive Module
import { CurrencySelectionDirectiveModule } from '../_directive/currency-selection/module';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule,

    CurrencySelectionDirectiveModule
  ],
  declarations: [
    CurrencyViewComponent,

    // directives
    CurrencyEditMapDirectiveComponent
  ],
  providers: []
})
export class CurrencyModule {}
