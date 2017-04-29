import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { NavComponent } from './nav.component';


@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    NavComponent
  ],
  providers: [],
  exports: [NavComponent]
})
export class NavModule {}
