import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../service/auth.service';

import { RecordsViewComponent } from './view/records.view.component';
import { RecordsAddComponent } from './add/records.add.component';

const routes: Routes = [{
  canActivate: [AuthGuard],
  path: 'records',

  children: [{
    path: '',
    component: RecordsViewComponent
  }, {
    path: 'add',
    component: RecordsAddComponent
  }]
  
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class ChildRoutingModule {}


/*
Copyright 2017 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
