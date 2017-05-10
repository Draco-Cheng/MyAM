import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// routing
import { ChildRoutingModule } from './profile.routing';

// components
import { ProfileViewComponent } from './view/profile.view.component';

// components
import { AddDbPopOutDirectiveComponent } from './_directive/add-db-pop-out.directive.component';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    FormsModule
  ],
  declarations: [
    ProfileViewComponent,
    AddDbPopOutDirectiveComponent
  ],
  providers: []
})
export class ProfileModule {}
