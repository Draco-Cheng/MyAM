import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routing
import { ChildRoutingModule } from './types.routing';

// components
import { TypesViewComponent } from './view/types.view.component';

// Directive Component
import { TypeMapEditDirectiveComponent } from './_directive/type-map-edit.directive.component';

// Global Directive Module
import { TypeMapPanelDirectiveModule } from '../_directive/type-map-panel/module';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule,

    TypeMapPanelDirectiveModule
  ],
  declarations: [
    TypesViewComponent,

    // directives
    TypeMapEditDirectiveComponent
  ],
  providers: []
})
export class TypesModule {}
