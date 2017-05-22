import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



// Directive Component
import { TypeMapPanelPopOutDirectiveComponent } from './type-map-panel-pop-out.directive.component';
import { TypeMapPanelDirectiveComponent } from './type-map-panel.directive.component';
import { TypeMapFragmentDirectiveComponent } from './type-map-fragment.directive.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    TypeMapPanelPopOutDirectiveComponent,
    TypeMapPanelDirectiveComponent,
    TypeMapFragmentDirectiveComponent
    
  ],
  providers: [],
  exports: [
    TypeMapPanelPopOutDirectiveComponent,
    TypeMapPanelDirectiveComponent    
  ]
})
export class TypeMapPanelDirectiveModule {}
