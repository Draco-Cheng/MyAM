import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routing
import { ChildRoutingModule } from './admin.routing';

// components
import { AdminViewComponent } from './view/admin.view.component';


@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule
  ],
  declarations: [
    AdminViewComponent
  ],
  providers: []
})
export class AdminModule {}
