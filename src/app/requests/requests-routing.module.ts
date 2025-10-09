// file: src/app/admin/requests/requests-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestsListComponent } from './list.component';
import { RequestAddEditComponent } from './add-edit.component';

const routes: Routes = [
  { path: '', component: RequestsListComponent },           // list of requests
  { path: 'add', component: RequestAddEditComponent },      // add new request
  { path: 'edit/:id', component: RequestAddEditComponent }  // edit request by id
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule {}
