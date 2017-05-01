import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



// Directive Component
import { TypeQuickListDirectiveComponent } from './type-quick-list.directive.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    TypeQuickListDirectiveComponent
  ],
  providers: [],
  exports: [
    TypeQuickListDirectiveComponent
  ]
})
export class TypeQuickListDirectiveModule {}
